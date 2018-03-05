/**
 * https://hackernoon.com/testing-react-components-with-jest-and-enzyme-41d592c174f
 */

import Enzyme, { mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
// React 16 Enzyme adapter
Enzyme.configure({ adapter: new Adapter() });
// Make some Enzyme functions available in all test files without importing
global.mount = mount;
