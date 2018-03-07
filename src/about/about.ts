/**
 * About handler
 */

import { MyWindow } from '../index';
import { cardUpdate } from '../dashboard/dashboard';

declare let window: MyWindow;

window.about = (): void => {
    cardUpdate();
};