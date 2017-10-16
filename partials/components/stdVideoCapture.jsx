const React = require('react');

const VideoRecorder = require('alpha-client-lib/partials/video/videoRecorder');
const VideoPlayer = require('alpha-client-lib/partials/video/videoPlayer');
const FileUtils = require('xbuilder-core/lib/fileUtils');

const Loading = require('xbuilder-core/helpers/loading');


import FlatButton from 'material-ui/FlatButton';
import VideoSVG from 'material-ui/svg-icons/av/videocam';
import SaveSVG from 'material-ui/svg-icons/file/file-upload';
const styles = require('../../style/videoCapture.css');

// Test for MediaRecorder API enabled
var mediaRecorderSupported = 0;
try {
	mediaRecorderSupported = MediaRecorder ? 1 : 0;
}
catch(err){}
// Only allow recording browser if Chome >= 49 or Firefox >= 29
var uaParser = require('ua-parser-js');
if(mediaRecorderSupported)
{
	var ua = new uaParser();
	ua = ua.getResult();
	var major = ua.browser.major;
	if(ua.browser.name == "Chrome" && major && Number(major) < 49)
		mediaRecorderSupported = 0;
	else if(ua.browser.name == "Firefox" && major && Number(major) < 29)
		mediaRecorderSupported = 0;
}	

const StdVideoCapture = React.createClass({
	getInitialState() {
		return {
			recorder:this.get_videos().file ? 0 : 1,
			uploading:null,
			preview:null,
			durationOk:null,
			playerEnabled:1,
			editIcon:this.props.editIcon && this.get_videos().file
		}
	},
	get_videos() {
		return this.props.state.data[this.props.name] || {};
	},
	componentDidMount(){
		// Trigger a form update/validation
		this.props.updated(this.props.state);
	},
	saveVideo: function() {
		var _this = this;
		var file = this.state.preview;
		
		if(this.refs.player)
			this.refs.player.pause();

		_this.setState({uploading: '...',totalSize:'...'},()=>{
			var elm = document.getElementById(_this.props.id+"progress");
			if(elm)
      			elm.scrollIntoView({behavior: "smooth"});
		});
		
		// Create a unique name to file for uploading to cloud
		var file_ext = file.name.toLowerCase().split('.').pop();
		file.newname = 'weestay-'+ FileUtils.guid() + '.' + file_ext;

		FileUtils.save(
			file,
			this.props.fieldId,
			{
				progress: function(percent, totalSize, uploading)
				{
					_this.setState({totalSize: totalSize, uploading: uploading});
				},
				success:function(r)
				{
					_this.setState({
						playerEnabled:0,// This forces <VideoPlayer inline to false therefore causing it to reload
						totalSize: null,
						uploading: null,
						recorder:0,
						preview:null,
						durationOk:null
					}, ()=>{
						// Trigger a form update/validation
						var _s = Object.assign({}, _this.props.state);
						_s.data[_this.props.name] = {file:file.newname};
						_this.props.updated(_s, ()=>{
							_this.setState({playerEnabled:1});
							if(_this.props.onSuccess)
								_this.props.onSuccess();
						});

					});

				},
				fail: function(r,s,x)
				{
					//Do something here when the upload fails
					//May be make a call to server to delete the AlphaFile
					console.log('Failed to Upload Video');
				}
			},
		);
	},
	getDuration(duration){
		if(this.state.preview)
		{
			if(duration < this.props.minDuration || duration > this.props.maxDuration)
			{
				emitter.emit('info_msg','Video length must be between '+this.props.minDuration+' and '+this.props.maxDuration+' seconds. Please record again.');
				this.setState({recorder:1,preview:null});
			}	
			else
				this.setState({durationOk:1});

		}
	},
	render: function() {
		var _this = this;

		var s = this.state;
		var p = this.props;

		var alternativeRecording = function(capture, idx){
			return (
				<input
					ref={"hiddenFileInput"+idx}
					type="file"
					accept="video/*"
					capture={capture?true:false}
					onClick={()=>alert("Reminder:" + (p.minDuration && p.maxDuration? "\n- Between "+p.minDuration+" and " + p.maxDuration + " seconds":"") + "\n- Record in 16:9 for best results (hold your device in landscape mode)")}
					onChange={()=>{
					 	var f = _this.refs['hiddenFileInput'+idx].files[0];
					 	if(f)
					 	{
					 		if(f.type != 'video/mp4' && f.type != 'video/quicktime' && f.type != 'video/webm')
						 		emitter.emit('info_msg', 'Only the following formats are supported: mp4, mov, webm');
						 	else
					 			_this.setState({preview:f,recorder:0,durationOk:p.minDuration || p.maxDuration ? null : 1});
				 		}
					 }}
			 	/>
			);
		};

		return (
			<div style={Object.assign({},p.style)} id={p.id}>
				{p.label ?
					<div style={{marginBottom:10}} dangerouslySetInnerHTML={{__html:p.label}}/>
				:null}
				{p.afterLabel ?
					<div style={{marginBottom:10}} dangerouslySetInnerHTML={{__html:p.afterLabel}}/>
				:null}

				<div className="clearFix" style={{position:'relative'}}>
					<div className={[styles.player, s.uploading === null ? '' : styles.playerWhileUploading].join(' ')}>
						{(this.get_videos().file || s.preview) && !s.recorder && s.playerEnabled ?
							<VideoPlayer
								width={'100%'}
								fluid={true}
					    		src={s.preview ? {file:s.preview} : this.get_videos()}
					    		srcPrefix="https://storage.googleapis.com/weestay-cloud-storage/"
					    		fromBlob={s.preview ? true : false}
					    		getDuration={this.getDuration}
					    		autoplay={s.preview ? true : false}
					    		ref="player"
					    		edit={s.editIcon ? ()=> this.setState({editIcon:0,recorder:1,preview:null,durationOk:null}): false}
							/>

						:null}
						{!s.recorder ?
							<div>
								{s.preview && !s.durationOk ?
									<div style={{marginTop:10,color:'#666'}}>Watch your recording before saving...</div>
								:null}
								{s.preview ?
									<span>
										{this.get_videos().file ?
											<FlatButton
												label="Back"
												onClick={()=>{
													this.setState({editIcon:p.editIcon,preview:null,durationOk:null,playerEnabled:0}, function(){
														// This forces <VideoPlayer inline to false therefore causing it to reload
														_this.setState({playerEnabled:1});
													})
												}}
											/>
										:null}
										<FlatButton
											disabled={!s.durationOk}
											secondary={true}
											icon={<SaveSVG/>}
											label="Save"
											onClick={this.saveVideo}
										/>
									</span>
								:null}
								{!s.editIcon ?
									<FlatButton
										label="Change"
										icon={<VideoSVG />}
										onClick={()=>this.setState({recorder:1,preview:null,durationOk:null})}
									/>
								:null}
							</div>
						:null}
					</div>

					{s.uploading !== null ?
						<div className={styles.uploading} id={p.id+"progress"}>
							<Loading size={0.5} />
								<div>Uploading<br />This may take a moment!</div>
				          <div>
				            {s.uploading} / {s.totalSize}
				          </div>
						</div>
					:null}
				</div>
				
				{s.recorder ?
					<div>
						{/* If the user clicks the alternative recoding then we need to hide the VideoRecorder or 
							mobile devices complain that the camera is not available
						*/}
						{mediaRecorderSupported ?
							<div>
								{s.enableAlternativeRecording ?
									<FlatButton
										className={styles.backBrowserCamera}
										label="Back to browser camera"
										onClick={()=>this.setState({enableAlternativeRecording:0})}
									/>
								:
									<div>
										<VideoRecorder
											id={p.id+'Recorder'}
											onRecordComplete={(file)=>this.setState({preview: file,recorder:0,durationOk:p.minDuration || p.maxDuration ? null : 1})}
											maxDuration={p.maxDuration}
											landscapeOnly={true}
										/>
									</div>
								}
							</div>
						: 
							<span>
								<label className={styles.uploadFromDeviceLabel}>
									<VideoSVG style={{width:70,height:70}}/>
									<br/>
									<span style={{fontWeight:500,fontSize:'14px'}}>RECORD FROM DEVICE</span>
									{alternativeRecording(false,1)}
								</label>
								{/*<label className={styles.uploadFromDeviceLabel}>
									<VideoSVG style={{width:70,height:70}}/>
									<br/>
									<span style={{fontWeight:500,fontSize:'14px'}}>RECORD FROM DEVICE</span>
									{alternativeRecording(true,1)}
								</label>
								<label className={styles.alternativeInputLabel}>
									<span>Alterantively upload file</span>
									{alternativeRecording(false,2)}
								</label>*/}
							</span>
						}
						{this.get_videos().file ?
							<FlatButton
								style={{top:10,display:'block'}}
								backgroundColor="#EFEFEF"
								label="Back"
								onClick={()=>this.setState({editIcon:p.editIcon,recorder:0,preview:null,durationOk:null})}
							/>
						:null}
						<div style={{marginTop:10}}>
							{p.minDuration && p.maxDuration?
								<div>*Between {p.minDuration} and {p.maxDuration} seconds</div>
							:null}
							<div>*Record in 16:9 for best results (hold your device in landscape mode)</div>
						</div>
						{mediaRecorderSupported ?
							<div className={styles.alternativeContainer}>
								{!s.enableAlternativeRecording ?
									<span>Alternatively <span className="blueLink" onClick={()=>this.setState({enableAlternativeRecording:1})}>upload a recording</span> from your device</span>
								:
									<span>
										<label className={styles.alternativeInputLabel}>
											<VideoSVG /><span>RECORD FROM DEVICE</span>
											{alternativeRecording(false,1)}
										</label>
										{/*<label className={styles.alternativeInputLabel}>
											<VideoSVG /><span>RECORD FROM DEVICE</span>
											{alternativeRecording(true,1)}
										</label>
										<br/><span style={{color:'#999'}}>-- or --</span><br/>
										<label className={styles.alternativeInputLabel}>
											<SaveSVG /><span>UPLOAD FILE FROM DEVICE</span>
											{alternativeRecording(false,2)}
										</label>*/}
									</span>
							 	}
							</div>
						:null}
					</div>
				:null}

				
				<input type="hidden" name={p.name} value={this.get_videos().file || ''} />
			</div>
		);
	}
});

module.exports = StdVideoCapture;
