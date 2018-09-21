/**
 * Expense handler
 */
import { DateRangePicker, DatePicker, TimePicker, RangeEventArgs } from '@syncfusion/ej2-calendars';
import { DataManager, Query, Predicate } from '@syncfusion/ej2-data';
import { Grid, Page, Edit, Toolbar, CommandColumn, ContextMenu, Resize, CheckBoxChangeEventArgs } from '@syncfusion/ej2-grids';
import { Button, CheckBox, RadioButton, ChangeArgs } from '@syncfusion/ej2-buttons';
import { Dialog, Tooltip } from '@syncfusion/ej2-popups';
import { DropDownList, MultiSelect } from '@syncfusion/ej2-dropdowns';
import { NumericTextBox, Input } from '@syncfusion/ej2-inputs';
import { Ajax, KeyboardEventArgs, isNullOrUndefined as isNOU } from '@syncfusion/ej2-base';
Grid.Inject(Edit, Toolbar, Page, CommandColumn, ContextMenu, Resize, );
import { cardUpdate, IExpense } from '../dashboard/dashboard';
import { MyWindow, dataSource, toggleFilterMenu } from '../index';
import { Category } from '@syncfusion/ej2-charts';
import { categoryIncomeData, categoryExpenseData } from '../common/common.data';

declare let window: MyWindow;
let incomeRadio: RadioButton;
let expenseRadio: RadioButton;
let cashRadio: RadioButton;
let creditRadio: RadioButton;
let debitRadio: RadioButton;
let datepicker: DatePicker;
let timepicker: TimePicker;
let amount: NumericTextBox;
let category: DropDownList;
let paymentmode: DropDownList;
let subCategory: DropDownList;
let income: CheckBox;
let cash: CheckBox;
let creditcard: CheckBox;
let debitcard: CheckBox;
let expense: CheckBox;
let dateRangePickerObject: DateRangePicker;
let addExpenseDialog: Dialog;
let editExpenseDialog: Dialog;
let confirmDialogObj: Dialog;
let tooltipEdit: Tooltip;
let tooltipDelete: Tooltip;
let tooltipHover: boolean;

let gridDS: { [key: string]: Object[] };
let multiSelectFilter: MultiSelect;
let grid: Grid;
let filterMinAmount: NumericTextBox;
let filterMaxAmount: NumericTextBox;
let tempData: IExpense[] = <IExpense[]>dataSource;
let filterCategory: string[] = [];
let numMinValue: number;
let numMaxValue: number;
/* tslint:disable */
let editRowData: any;
let minAmount: any;
let maxAmount: any;
let editValue: number;
let deleteValue: number;
/* tslint:enable */
let defaultGrigColumns: Object[] = [
    { type: 'checkbox', width: 40, },
    {
        field: 'Category',
        headerText: 'Category',
        template: '#template',
        width: 178,
        editType: 'dropdownedit',
        validationRules: { required: true },
        clipMode: 'ellipsiswithtooltip'
    }, {
        field: 'DateTime',
        headerText: 'Date',
        format: 'yMd',
        width: 112,
        editType: 'datepickeredit',
        validationRules: { required: true },
        hideAtMedia: '(min-width: 1050px)'
    },
    {
        field: 'PaymentMode',
        headerText: 'Payment Mode',
        width: 140,
        editType: 'dropdownedit',
        validationRules: { required: true },
        hideAtMedia: '(min-width: 600px)'
    },
    {
        field: 'Description',
        headerText: 'Description',
        clipMode: 'ellipsis',
        validationRules: { required: true },
        hideAtMedia: '(min-width: 1050px)'
    },
    {
        field: 'UniqueId',
        headerText: 'Unique Id',
        isPrimaryKey: true,
        visible: false
    },
    {
        field: 'Amount',
        headerText: 'Amount',
        editType: 'numericedit',
        width: 120,
        format: 'C0',
        template: '#amtTemplate',
        validationRules: { required: true },
        textAlign: 'right'
    }
];

function onGridRender(): void {
    if (grid) {
        let editElement: HTMLElement = document.getElementById('grid_edit');
        let deleteElement: HTMLElement = document.getElementById('grid_delete');
        if (editElement) {
            grid.toolbarModule.toolbar.enableItems(editElement.parentElement, false);
            editElement.parentElement.title = ' ';
        }
        if (deleteElement) {
            grid.toolbarModule.toolbar.enableItems(deleteElement.parentElement, false);
            deleteElement.parentElement.title = ' ';
        }
        editValue = 0;
        deleteValue = 0;
    }
}

function onGridCheckBoxChange(args: CheckBoxChangeEventArgs): void {
    if (grid.getSelectedRowIndexes().length > 1) {
        grid.toolbarModule.toolbar.enableItems(document.getElementById('grid_edit').parentElement, false);
        grid.toolbarModule.toolbar.enableItems(document.getElementById('grid_delete').parentElement, true);
        editValue = 2;
        deleteValue = 2;

    } else if (grid.getSelectedRowIndexes().length === 0) {
        grid.toolbarModule.toolbar.enableItems(document.getElementById('grid_edit').parentElement, false);
        grid.toolbarModule.toolbar.enableItems(document.getElementById('grid_delete').parentElement, false);
        editValue = 0;
        deleteValue = 0;
    } else if (grid.getSelectedRowIndexes().length === 1) {
        grid.toolbarModule.toolbar.enableItems(document.getElementById('grid_edit').parentElement, true);
        grid.toolbarModule.toolbar.enableItems(document.getElementById('grid_delete').parentElement, true);
        editValue = 1;
        deleteValue = 1;
    }
}
// tslint:disable-next-line:max-func-body-length

window.expense = (): void => {
    cardUpdate();
    let predicateSt: Predicate = new Predicate('Spent', 'equal', 10);
    let predicateStart: Predicate = new Predicate('DateTime', 'greaterthanorequal', window.startDate);
    let predicateEnd: Predicate = new Predicate('DateTime', 'lessthanorequal', window.endDate);
    let predicate: Predicate = predicateStart.and(predicateEnd);
    let query: Query = new Query().where(predicate).select(['Category', 'Budget', 'DateTime', 'Items', 'PaymentMode', 'Spent']).take(5);
    minMaxAmount(window.startDate, window.endDate);

    function minMaxAmount(start: Date, end: Date): void {
        let predicateStart: Predicate = new Predicate('DateTime', 'greaterthanorequal', start);
        let predicateEnd: Predicate = new Predicate('DateTime', 'lessthanorequal', end);
        minAmount = new DataManager(window.expenseDS).executeLocal((new Query()
            .where((predicateStart.and(predicateEnd))))
            .requiresCount().aggregate('min', 'Amount'));
        maxAmount = new DataManager(window.expenseDS).executeLocal((new Query()
            .where((predicateStart.and(predicateEnd))))
            .requiresCount().aggregate('max', 'Amount'));
        numMinValue = minAmount.aggregates['Amount - min'];
        numMaxValue = maxAmount.aggregates['Amount - max'];
    }
    /* tslint:disable */
    function onGridEditBegin(e: any): void {
        if (e.requestType == 'beginEdit') {
            editRowData = e;
            e.cancel = true;
        }
    }
    /* tslint:enable */
    let rowDiv: HTMLElement;
    let incomeElem: HTMLElement;
    let expenseElem: HTMLElement;
    let gridColumns: Object[] = defaultGrigColumns;

    grid = new Grid({
        dataSource: window.expenseDS,
        height: '100%',
        width: '100%',
        allowSelection: true,
        rowSelected: onGridCheckBoxChange,
        rowDeselected: onGridCheckBoxChange,
        dataBound: onGridRender,
        editSettings: { allowEditing: true },
        allowPaging: true,
        pageSettings: { pageSize: 11 },
        query: new Query().where(predicate).sortByDesc('DateTime'),
        cellSave: onGridSave,
        allowTextWrap: false,
        toolbar: ['Edit', 'Delete'],
        actionBegin: onGridEditBegin,
        columns: gridColumns,
        actionComplete: onGridActionComplete
    });
    grid.appendTo('#grid');
    if (document.getElementById('grid_edit')) {
        document.getElementById('grid_edit').onclick = (): void => {
            let ajax: Ajax = new Ajax('./src/expense/dialog.html', 'GET', true);
            ajax.send().then();
            ajax.onSuccess = (data: string): void => {
                grid.toolbarModule.toolbar.enableItems(document.getElementById('grid_delete').parentElement, true);
                if (editExpenseDialog) {
                    editExpenseDialog.show();
                } else {
                    editExpenseDialog = new Dialog({
                        header: 'Edit Transaction',
                        content: data,
                        visible: false,
                        showCloseIcon: true,
                        closeOnEscape: false,
                        isModal: true,
                        target: document.body,
                        buttons: [{
                            click: onSaveTransaction, buttonModel: { content: 'Save', cssClass: 'e-info e-save', isPrimary: true }
                        }, { click: onNewDialogCancel, buttonModel: { cssClass: 'e-outline e-cancel', content: 'Cancel' } }],
                        width: '100%',
                        height: '85%',
                        animationSettings: { effect: 'None' },
                        open: onEditDialogOpen,
                        close: onEditDialogClose,
                        overlayClick: dlgOverlayClicked
                    });
                    editExpenseDialog.appendTo('#dialog');
                    editExpenseDialog.show();
                }
            };
        };
    }
    if (document.getElementById('grid_delete')) {
        document.getElementById('grid_delete').onclick = (): void => {
            confirmDialogObj = new Dialog({
                header: 'Delete',
                visible: false,
                width: '40%',
                isModal: true,
                content: '<span>Are you sure you want to delete the selected transaction(s)?</span>',
                showCloseIcon: true, closeOnEscape: false,
                buttons: [{
                    click: confirmDlgYesBtnClick,
                    buttonModel: { content: 'Yes', cssClass: 'e-ok e-flat', isPrimary: true }
                },
                { click: confirmDlgNoBtnClick, buttonModel: { cssClass: 'e-flat e-no', content: 'No' } }],
                target: document.body,
                animationSettings: { effect: 'None' },
                open: alertDialogOpen, close: dialogClose,
                overlayClick: dlgOverlayClicked
            });
            confirmDialogObj.appendTo('#confirmDialog');
            confirmDialogObj.show();
        };
    }
    function dialogClose(): void {
        confirmDialogObj.destroy();
        confirmDialogObj = null;
    }
    function confirmDlgNoBtnClick(): void {
        confirmDialogObj.hide();
    }
    function confirmDlgYesBtnClick(): void {
        let selectedRecords: Object[] = grid.getSelectedRecords();
        for (let i: number = 0; i < selectedRecords.length; i++) {
            new DataManager(window.expenseDS).remove('UniqueId', selectedRecords[i]);
        }
        grid.setProperties({
            dataSource: window.expenseDS,
            query: new Query().where(predicate).sortByDesc('DateTime')
        });
        grid.refresh();
        cardUpdate();
        confirmDialogObj.hide();
    }

    let searchKey: HTMLInputElement = document.getElementById('txt') as HTMLInputElement;
    Input.createInput({
        element: searchKey,
        properties: {
            showClearButton: true
        }
    });
    document.getElementById('searchbtn').onclick = () => {
        grid.search(searchKey.value);
    };

    /** Performs search operation when press Enter key */
    searchKey.onkeyup = (e: KeyboardEventArgs) => {
        if (e.keyCode === 13) { grid.search(searchKey.value); }
    };

    searchKey.onblur = () => {
        grid.search(searchKey.value);
    };
    (document.getElementsByClassName('e-clear-icon')[0] as HTMLElement).onmousedown = (): void => {
        searchKey.value = '';
    };
    // Initializing the add expense button
    let button: Button = new Button({});
    button.appendTo('#addexpense');
    function onCheckBoxChange(): void {
        generatePredicate(dateRangePickerObject.startDate, dateRangePickerObject.endDate, '');
    }

    document.getElementById('add-btn').onclick = (): void => {
        showAddDialog();
    };

    document.getElementById('addexpense').onclick = (): void => {
        showAddDialog();
    };

    /** Disables edit toolbar item in the Expense Grid on the initial load */
    /* tslint:disable */
    function onGridActionComplete(e: any): void {
        setTimeout(() => {
            grid.toolbarModule.toolbar.enableItems(document.getElementById('grid_edit').parentElement, false);
        }, 0);
    }
    /* tslint:enable */

    function showAddDialog(): void {
        let ajax: Ajax = new Ajax('./src/expense/dialog.html', 'GET', true);
        ajax.send().then();
        ajax.onSuccess = (data: string): void => {
            if (addExpenseDialog) {
                addExpenseDialog.show();
            } else {
                addExpenseDialog = new Dialog({
                    header: 'New Transaction',
                    content: data,
                    visible: false,
                    showCloseIcon: true,
                    closeOnEscape: false,
                    isModal: true,
                    target: document.body,
                    buttons: [{
                        click: addNewTransaction, buttonModel: { content: 'Add', cssClass: 'e-info e-add', isPrimary: true }
                    },
                    {
                        click: onNewDialogCancel, buttonModel: { cssClass: 'e-outline e-cancel', content: 'Cancel' }
                    }
                    ],
                    width: '100%',
                    height: '85%',
                    animationSettings: { effect: 'None' },
                    open: onNewDialogOpen,
                    close: onNewDialogClose,
                    overlayClick: dlgOverlayClicked
                });
                addExpenseDialog.appendTo('#addexpenseDialog');
                addExpenseDialog.show();
            }
        };
    }

    function dlgOverlayClicked(): void {
        if (addExpenseDialog) {
            addExpenseDialog.hide();
        }
        if (confirmDialogObj) {
            confirmDialogObj.hide();
        }
        if (editExpenseDialog) {
            editExpenseDialog.hide();
        }
    }

    /* tslint:disable-next-line */
    function onSaveTransaction(args: any): void {
        let newExpense: NewExpense = {
            'UniqueId': editRowData.rowData.UniqueId,
            'DateTime': new Date(datepicker.value.setHours(timepicker.value.getHours())),
            'Category': <string>category.value,
            'PaymentMode': (cashRadio.checked && cashRadio.label) ||
            (creditRadio.checked && creditRadio.label) || (debitRadio.checked && debitRadio.label),
            'TransactionType': (incomeRadio.checked && incomeRadio.label) || (expenseRadio.checked && expenseRadio.label),
            'Description': (<HTMLInputElement>document.getElementById('description')).value,
            'Amount': '' + amount.value
        };
        new DataManager(window.expenseDS).update('UniqueId', newExpense);
        grid.setProperties({
            dataSource: window.expenseDS,
            query: new Query().where(predicate).sortByDesc('DateTime')
        });
        grid.refresh();
        cardUpdate();
        editExpenseDialog.hide();
    }

    function addNewTransaction(): void {
        let newExpense: NewExpense = {
            'UniqueId': 'T' + ('' + (+new Date())).substring(5, 10),
            'DateTime': new Date(datepicker.value.setHours(timepicker.value.getHours())),
            'Category': <string>category.value,
            'PaymentMode': (cashRadio.checked && cashRadio.label) ||
            (creditRadio.checked && creditRadio.label) || (debitRadio.checked && debitRadio.label),
            'TransactionType': (incomeRadio.checked && incomeRadio.label) || (expenseRadio.checked && expenseRadio.label),
            'Description': (<HTMLInputElement>document.getElementById('description')).value,
            'Amount': '' + amount.value
        };
        new DataManager(window.expenseDS).insert(newExpense);
        new DataManager(window.expenseDS).update('UniqueId', {
            UniqueId: newExpense.UniqueId,
            'DateTime': (datepicker.value),
            'Category': newExpense.Category,
            'PaymentMode': (cashRadio.checked && cashRadio.label) ||
            (creditRadio.checked && creditRadio.label) || (debitRadio.checked && debitRadio.label),
            'TransactionType': newExpense.TransactionType,
            'Description': newExpense.Description,
            'Amount': '' + newExpense.Amount
        });
        grid.setProperties({
            dataSource: window.expenseDS,
            query: new Query().where(predicate).sortByDesc('DateTime')

        });
        grid.refresh();
        addExpenseDialog.hide();
        cardUpdate();
    }

    function onNewDialogCancel(): void {
        (<HTMLElement>document.querySelector('.e-dlg-closeicon-btn')).click();
    }
    function onNewDialogClose(): void {
        this.dlgContainer.style.zIndex = '100';
        addExpenseDialog.destroy();
        addExpenseDialog = null;
    }

    function onChange(args: ChangeArgs): void {
        if (this.element.value === 'Income') {
            category.dataSource = categoryIncomeData;
        } else {
            category.dataSource = categoryExpenseData;
        }
    }

    function createDialogComponent(): void {
        incomeRadio = new RadioButton({ value: 'Income', label: 'Income', name: 'dlgTransactionType', change: onChange });
        incomeRadio.appendTo('#incomeradio');
        expenseRadio = new RadioButton({ value: 'Expense', label: 'Expense', name: 'dlgTransactionType', checked: true, change: onChange });
        expenseRadio.appendTo('#expenseradio');
        datepicker = new DatePicker({
            placeholder: 'Choose a Date', width: '100%', value: window.endDate,
            floatLabelType: 'Always'
        });
        datepicker.appendTo('#datepicker');
        timepicker = new TimePicker({
            placeholder: 'Choose a Time', width: '100%', floatLabelType: 'Always', value: new Date()
        });
        timepicker.appendTo('#timepicker');
        category = new DropDownList({
            placeholder: 'Select a Category',
            cssClass: 'Category',
            floatLabelType: 'Always',
            dataSource: categoryExpenseData,
            fields: { text: 'Category', iconCss: 'Class', value: 'Category' },
        });
        category.appendTo('#category');
        creditRadio = new RadioButton({ value: 'Credit Card', label: 'Credit Card', name: 'dlgPaymentMode' });
        creditRadio.appendTo('#creditradio');
        debitRadio = new RadioButton({ value: 'Debit Card', label: 'Debit Card', name: 'dlgPaymentMode' });
        debitRadio.appendTo('#debitradio');
        cashRadio = new RadioButton({ value: 'Cash', label: 'Cash', checked: true, name: 'dlgPaymentMode' });
        cashRadio.appendTo('#cashradio');
        amount = new NumericTextBox({
            placeholder: 'Enter a Amount',
            floatLabelType: 'Always',
            format: 'c2',
            min: 0
        });
        amount.appendTo('#amount');
    }
    function alertDialogOpen(): void {
        this.dlgContainer.style.zIndex = '1000000';
    }
    function onEditDialogClose(): void {
        document.body.style.overflowY = 'auto';
        editExpenseDialog.destroy();
        editExpenseDialog = null;
    }
    function onEditDialogOpen(): void {
        this.dlgContainer.style.zIndex = '1000000';
        document.body.style.overflowY = 'hidden';
        createDialogComponent();
        if (editRowData.rowData.TransactionType === 'Income') {
            incomeRadio.checked = true;
            category.dataSource = categoryIncomeData;
        }
        if (editRowData.rowData.TransactionType === 'expense') {
            expenseRadio.checked = true;
            category.dataSource = categoryExpenseData;
        }
        datepicker.value = editRowData.rowData.DateTime;
        timepicker.value = editRowData.rowData.DateTime;
        if (editRowData.rowData.PaymentMode === 'Credit Card') {
            creditRadio.checked = true;
        } else if (editRowData.rowData.PaymentMode === 'Debit Card') {
            debitRadio.checked = true;
        } else if (editRowData.rowData.PaymentMode === 'Cash') {
            cashRadio.checked = true;
        }
        (<HTMLInputElement>document.getElementById('description')).value = editRowData.rowData.Description;
        category.value = editRowData.rowData.Category;
        amount.value = editRowData.rowData.Amount;

    }
    function onNewDialogOpen(): void {
        this.dlgContainer.style.zIndex = '1000000';
        createDialogComponent();
    }
    function generatePredicate(start: Date, end: Date, updater: string): void {
        let predicates: Predicate;
        let predicatesStart: Predicate = new Predicate('DateTime', 'greaterthanorequal', start);
        let predicatesEnd: Predicate = new Predicate('DateTime', 'lessthanorequal', end);
        predicates = predicatesStart.and(predicatesEnd);
        let predIncome: Predicate;
        let predExpense: Predicate;
        let predCash: Predicate;
        let predDebit: Predicate;
        let preCredit: Predicate;
        let preCategory: Predicate;
        let preCategorys: Predicate;
        minMaxAmount(dateRangePickerObject.startDate, dateRangePickerObject.endDate);
        if (updater === 'dateChange') {
            if (!isNOU(numMinValue) && !isNOU(numMaxValue)) {
                filterMinAmount.setProperties({
                    min: numMinValue,
                    value: numMinValue
                });
                filterMaxAmount.setProperties({
                    max: numMaxValue,
                    value: numMaxValue
                });
            }
        }
        /* tslint:disable */
        let val: any = [filterMinAmount.value, filterMaxAmount.value];
        /* tslint:enable */
        let predMinAmt: Predicate = new Predicate('Amount', 'greaterthanorequal', val[0]);
        let predMaxAmt: Predicate = new Predicate('Amount', 'lessthanorequal', val[1]);
        predicates = predicates.and(predMinAmt).and(predMaxAmt);
        if (income.checked || expense.checked) {
            if (income.checked) {
                predIncome = new Predicate('TransactionType', 'equal', 'Income');
            }
            if (expense.checked) {
                predExpense = new Predicate('TransactionType', 'equal', 'Expense');
            }
            if (expense.checked && income.checked) {
                predIncome = predIncome.or(predExpense);
                predicates = predicates.and(predIncome);
            } else if (income.checked) {
                predicates = predicates.and(predIncome);
            } else if (expense.checked) {
                predicates = predicates.and(predExpense);
            }
        }
        if (cash.checked || debitcard.checked || creditcard.checked) {
            if (cash.checked) {
                predCash = new Predicate('PaymentMode', 'equal', 'Cash');
            }
            if (creditcard.checked) {
                preCredit = new Predicate('PaymentMode', 'equal', 'Credit Card');
            }
            if (debitcard.checked) {
                predDebit = new Predicate('PaymentMode', 'equal', 'Debit Card');
            }
            if (cash.checked && creditcard.checked && debitcard.checked) {
                predIncome = preCredit.or(predDebit).or(predCash);
                predicates = predicates.and(predIncome);
            } else if (cash.checked && creditcard.checked) {
                predIncome = predCash.or(preCredit);
                predicates = predicates.and(predIncome);
            } else if (cash.checked && debitcard.checked) {
                predIncome = predCash.or(predDebit);
                predicates = predicates.and(predIncome);
            } else if (creditcard.checked && debitcard.checked) {
                predIncome = preCredit.or(predDebit);
                predicates = predicates.and(predIncome);
            } else if (cash.checked) {
                predicates = predicates.and(predCash);
            } else if (debitcard.checked) {
                predicates = predicates.and(predDebit);
            } else if (creditcard.checked) {
                predicates = predicates.and(preCredit);
            }
        }
        if (!isNOU(multiSelectFilter.value) && multiSelectFilter.value.length > 0) {
            let list: string[] = <string[]>multiSelectFilter.value;
            for (let i: number = 0; i < list.length; i++) {
                preCategory = new Predicate('Category', 'equal', list[i]);
                if (i === 0) {
                    preCategorys = preCategory;
                } else {
                    preCategorys = preCategorys.or(preCategory);
                }
            }
            predicates = predicates.and(preCategorys);
        }
        grid.setProperties({
            dataSource: window.expenseDS,
            query: new Query().where(predicates).sortByDesc('DateTime')

        });
        grid.refresh();
        getCategory(dateRangePickerObject.startDate, dateRangePickerObject.endDate);
        multiSelectFilter.dataSource = filterCategory;
        multiSelectFilter.dataBind();
    }
    function amountChanged(): void {
        generatePredicate(dateRangePickerObject.startDate, dateRangePickerObject.endDate, '');
    }
    function dateRangeChanged(args?: RangeEventArgs): void {
        window.startDate = args.startDate;
        window.endDate = args.endDate;
        cardUpdate(true);
        generatePredicate(dateRangePickerObject.startDate, dateRangePickerObject.endDate, 'dateChange');
    }
    dateRangePickerObject = new DateRangePicker({
        startDate: window.startDate,
        endDate: window.endDate,
        cssClass: 'DateTime',
        format: 'MM/dd/yyyy',
        showClearButton: false,
        allowEdit: false,
        change: dateRangeChanged
    });
    dateRangePickerObject.appendTo('#daterange');
    getCategory(dateRangePickerObject.startDate, dateRangePickerObject.endDate);
    multiSelectFilter = new MultiSelect({
        dataSource: filterCategory,
        placeholder: 'Select Categories',
        mode: 'Box',
        hideSelectedItem: true,
        closePopupOnSelect: false,
        select: categoryUpdated,
        removed: categoryUpdated
    });
    multiSelectFilter.appendTo('#expense-category');
    let searchEle: Element = document.getElementsByClassName('e-searcher')[0];
    searchEle.querySelector('input').setAttribute('readonly', 'true');
    filterMinAmount = new NumericTextBox({
        cssClass: 'inlineAlign',
        width: '55px',
        showSpinButton: false,
        format: 'c0',
        min: numMinValue,
        value: numMinValue,
        change: amountChanged
    });
    filterMinAmount.appendTo('#filterMinAmount');
    filterMaxAmount = new NumericTextBox({
        cssClass: 'inlineAlign',
        width: '60px',
        showSpinButton: false,
        format: 'c0',
        max: numMaxValue,
        value: numMaxValue,
        change: amountChanged,
    });
    filterMaxAmount.appendTo('#filterMaxAmount');

    income = new CheckBox({ label: 'Income', checked: true, cssClass: 'TransactionType', change: onCheckBoxChange });
    income.appendTo('#income');
    expense = new CheckBox({ label: 'Expense', checked: true, cssClass: 'TransactionType', change: onCheckBoxChange });
    expense.appendTo('#expenses');
    cash = new CheckBox({ label: 'Cash', checked: true, cssClass: 'PaymentMode', change: onCheckBoxChange });
    cash.appendTo('#cash');
    creditcard = new CheckBox({ label: 'Credit Card', checked: true, cssClass: 'PaymentMode', change: onCheckBoxChange });
    creditcard.appendTo('#creditcard');
    debitcard = new CheckBox({ label: 'Debit Card', checked: true, cssClass: 'PaymentMode', change: onCheckBoxChange });
    debitcard.appendTo('#debitcard');
    /* tslint:disable-next-line */
    function onGridSave(args: any): void {
        new DataManager(window.expenseDS).update('UniqueId', args.rowData);
    }

    function categoryUpdated(): void {
        setTimeout(() => {
            generatePredicate(dateRangePickerObject.startDate, dateRangePickerObject.endDate, '');
             /* tslint:disable-next-line */
        }, 10);
    }

    document.getElementById('filterExpense').onclick = (): void => {
        toggleFilterMenu();
    };
};

export function getCategory(start: Date, end: Date): void {
    filterCategory = [];
    /* tslint:disable-next-line */
    tempData.forEach(item => {
        /* tslint:enable-next-line */
        if (start.valueOf() <= item.DateTime.valueOf() && end.valueOf() >= item.DateTime.valueOf()) {
            if (filterCategory.indexOf(item.Category) < 0) {
                filterCategory.push(item.Category);
            }
        }
    });
}


interface NewExpense {
    UniqueId: string;
    DateTime: Date;
    Category: string;
    Amount: string;
    PaymentMode: number | string;
    TransactionType: string;
    Description: string;
}
