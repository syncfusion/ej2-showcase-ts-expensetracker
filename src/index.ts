/**
 * Expense Tracker
 */
import { addRoute, bypassed, parse } from 'crossroads';
import crossroads from 'crossroads';
import { Ajax, rippleEffect, enableRipple } from '@syncfusion/ej2-base';
import * as hasher from 'hasher';
import { isNullOrUndefined, Browser, Internationalization } from '@syncfusion/ej2-base';
import { expenseData, userInfo, startDate, endDate } from './common/common.data';
enableRipple(true);
import '../styles/index.scss';

window.expenseDS = expenseData;
window.userName = userInfo.FullName;
window.userFirstName = userInfo.FirstName;

let intl: Internationalization = new Internationalization();
window.getDate = (value: Date): string => {
    return intl.formatDate(value, { skeleton: 'yMd', type: 'date' });
};
window.getCurrencyVal = (value: number): string => {
    return intl.formatNumber(value, { format: 'C0' });
};
window.getNumberVal = (value: number): string => {
    return intl.getNumberFormat({ skeleton: 'C0', currency: 'USD' })(value);
};

export let dataSource: Object[] = [];
let menu: HTMLElement;
let overlay: HTMLElement;
declare let window: MyWindow;
enum ExpensePage {
    dashboard, about, expense
}
if (isNullOrUndefined(window.startDate)) {
    window.startDate = startDate;
    window.endDate = endDate;
}

/* tslint:disable-next-line */
function updateDate(list: any) {
    dataSource = list;
}
/* tslint:disable-next-line */
function parseDate(date: any) {
    return new Date((date).match(/\d+/)[0] * 1);
}
updateDate(expenseData);
handleResize();
function getCurrentPage(): string {
    let currentPage: string = "";
    if ((window.location.hash === '#/' + ExpensePage[ExpensePage.dashboard])) {
        currentPage = ExpensePage[ExpensePage.dashboard];
    } else if ((window.location.hash === '#/' + ExpensePage[ExpensePage.expense])) {
        currentPage = ExpensePage[ExpensePage.expense];
    } else if ((window.location.hash === '#/' + ExpensePage[ExpensePage.about])) {
        currentPage = ExpensePage[ExpensePage.about];
    }
    return currentPage;
}

rippleEffect(document.body, { selector: '.ripple-element', rippleFlag: true });

routeDefault();
let currentPage: string;
crossroads.addRoute('/{val}', () => {
    let sample: string = currentPage || getCurrentPage();
    if ((currentPage && currentPage !== '') || (window.location.hash === '#/' + getCurrentPage())) {
        if (!isNullOrUndefined(document.querySelector('.expense-active-page') as HTMLElement)) {
            document.querySelector('.expense-active-page')!.classList.remove('expense-active-page');
        }
        let ajaxHTML: Ajax = new Ajax(sample + '.html', 'GET', true);
        ajaxHTML.send().then((value: Object): void => {
            document.getElementById('content')!.innerHTML = '';
            document.getElementById('content')!.innerHTML = value.toString();
            document.body.className = '';
            if ((currentPage === ExpensePage[ExpensePage.dashboard]) ||
                ('#/' + ExpensePage[ExpensePage.dashboard] === window.location.hash)) {
                window.dashboard();
                document.querySelectorAll('.overview')[0].classList.add('expense-active-page');
                document.body.classList.add('dashboard-page');
            } else if ((currentPage === ExpensePage[ExpensePage.expense]) ||
                ('#/' + ExpensePage[ExpensePage.expense] === window.location.hash)) {
                window.expense();
                document.querySelectorAll('.expense')[0].classList.add('expense-active-page');
                document.body.classList.add('expense-page');
            } else if ((currentPage === ExpensePage[ExpensePage.about]) ||
                ('#/' + ExpensePage[ExpensePage.about] === window.location.hash)) {
                document.querySelectorAll('.about')[0].classList.add('expense-active-page');
                document.body.classList.add('about-page');
            }
        });
    }
});
bypassed.add((request: string) => {
    let samplePath: string[] = ['dashboard', 'about', 'expense'];
    let hash: string = request.split(' ')[0];
    if (samplePath.indexOf(hash) === -1) {
        location.hash = '#/' + samplePath[0];
    }
});

for (let i: number = 0; i < document.querySelectorAll('li').length; i++) {
    document.querySelectorAll('li')[i].addEventListener('click', hash, false);
}
function hash(args: MouseEvent): void {
    document.getElementById('sidebar-wrapper')!.classList.remove('close');
    document.getElementById('overlay')!.classList.remove('dialog');
    document.getElementById('overlay')!.style.background = 'none';
    if (!isNullOrUndefined(document.querySelector('.expense-active-page') as HTMLElement)) {
        document.querySelector('.expense-active-page')!.classList.remove('expense-active-page');
    }
    (<HTMLElement>args.currentTarget).firstElementChild!.classList.add('expense-active-page');
    hasher.setHash(((<HTMLElement>args.currentTarget).firstElementChild!.getAttribute('href') as string).split('/')[1]);
}

function routeDefault(): void {
    crossroads.addRoute('', () => {
        window.location.href = '#/dashboard';
    });
}

hasher.initialized.add((hashValue: string) => {
    crossroads.parse(hashValue);
});

hasher.changed.add((hashValue: string) => {
    currentPage = hashValue;
    crossroads.parse(hashValue);
});

hasher.init();

(window as any).onresize = (args: MouseEvent): void => {
    handleResize();
    if (!Browser.isDevice) {
        if (document.getElementById('sidebar-wrapper') &&
            document.getElementById('sidebar-wrapper')!.classList.contains('open')) {
            document.getElementById('sidebar-wrapper')!.classList.remove('open');
        }
        if (document.getElementById('sidebar-wrapper') &&
            document.getElementById('sidebar-wrapper')!.classList.contains('close')) {
            document.getElementById('sidebar-wrapper')!.classList.remove('close');
        }
        if (document.getElementById('overlay') &&
            document.getElementById('overlay')!.classList.contains('dialog')) {
            document.getElementById('overlay')!.classList.remove('dialog');
        }
        if ((<HTMLElement>document.getElementsByClassName('filter')[0]) &&
            (<HTMLElement>document.getElementsByClassName('filter')[0]).classList.contains('filter-open')) {
            (<HTMLElement>document.getElementsByClassName('filter')[0]).classList.remove('filter-open');
        }
        if ((<HTMLElement>document.getElementsByClassName('filter')[0]) &&
            (<HTMLElement>document.getElementsByClassName('filter')[0]).classList.contains('filter-close')) {
            (<HTMLElement>document.getElementsByClassName('filter')[0]).classList.remove('filter-close');
        }
    }
};
document.getElementById('menu-toggle')!.onclick = (): void => {
    menu = document.getElementById('sidebar-wrapper') as HTMLElement;
    overlay = document.getElementById('overlay') as HTMLElement;
    toggleMenu();
};
document.getElementById('filter-toggle')!.onclick = (): void => {
    toggleFilterMenu();
};
document.getElementById('overlay')!.onclick = (): void => {
    menu = document.getElementById('sidebar-wrapper') as HTMLElement;
    overlay = document.getElementById('overlay') as HTMLElement;
    handleOverlay();
};
(document.getElementsByClassName('nav-list')[0] as HTMLElement).onclick = (args: MouseEvent): void => {
    if ((args.target as HTMLElement).nodeName === 'A') {
        menu = document.getElementById('sidebar-wrapper') as HTMLElement;
        overlay = document.getElementById('overlay') as HTMLElement;
        handleOverlay();
    }
};

function toggleMenu(): void {
    if (menu.classList.contains('open')) {
      removeToggleClass();
      menu.classList.add('close');
      disableOverlay();
    } else if (menu.classList.contains('close')) {
      removeToggleClass();
      menu.classList.add('open');
      enableOverlay();
    } else {
      menu.classList.add('open');
      enableOverlay();
    }
}

function removeToggleClass(): void {
    menu.classList.remove('open');
    menu.classList.remove('close');
}

function enableOverlay(): void {
    overlay.classList.add('dialog');
    overlay.style.background = '#383838';
}

function disableOverlay(): void {
    overlay.classList.remove('dialog');
    overlay.style.background = 'none';
}

export function toggleFilterMenu(): void {
    menu = document.getElementById('sidebar-wrapper') as HTMLElement;
    overlay = document.getElementById('overlay') as HTMLElement;
    menu.style.zIndex = '10000';
    let filterMenu: Element = document.getElementsByClassName('sidebar-wrapper-filter')[0];
    if (filterMenu.classList.contains('filter-open')) {
      filterMenu.classList.remove('filter-open');
      filterMenu.classList.add('filter-close');
      disableOverlay();
    } else if (filterMenu.classList.contains('filter-close')) {
      filterMenu.classList.remove('filter-close');
      filterMenu.classList.add('filter-open');
      enableOverlay();
    } else {
      filterMenu.classList.add('filter-open');
      enableOverlay();
    }
}

function handleOverlay(): void {
    disableOverlay();
    removeToggleClass();
    removeFilterToggleClass();
}

function removeFilterToggleClass(): void {
    menu.style.zIndex = '100001';
    let filterMenu: Element = document.getElementsByClassName('sidebar-wrapper-filter')[0];
    if (!isNullOrUndefined(filterMenu)) {
        filterMenu.classList.remove('filter-open');
        filterMenu.classList.remove('filter-close');
    }
}

function handleResize(): void {
    if (document.documentElement.offsetWidth > 1400) {
        document.body.style.minHeight = 'auto';
        document.body.style.minHeight = document.documentElement.offsetHeight + 'px';
    }
}

export interface ResultData {
    result: { [key: string]: Object[] }[];
}

export interface MyWindow extends Window {
    expense: () => void;
    about: () => void;
    settings: () => void;
    dashboard: () => void;
    getDate: (value: Date) => string;
    getCurrencyVal: (value: number) => string;
    getNumberVal: (value: number) => string;
    expenseDS: Object;
    startDate: Date;
    endDate: Date;
    userName: string;
    userFirstName: string;
}