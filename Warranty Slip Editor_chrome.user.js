// ==UserScript==
// @name         Warranty Slip Editor
// @namespace    Hyperchicken.com
// @version      1.0
// @description  Adds the ability to edit the values in a warranty slip, including adding/deleting rows to the product table and setting the shipping method.
// @author       Petar Stankovic
// @match        https://www.pccasegear.com/elgg/warranty_invoice.php*
// @grant        none
// ==/UserScript==

//SELECTORS
//shipping address box selector
document.querySelector('body > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(3)').setAttribute('id', 'shippingAddress');
shippingAddress.setAttribute('class', 'editable');
var shippingAddressBox = document.getElementById('shippingAddress');

//billing address selector
document.querySelector('body > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1)').setAttribute('id', 'billingAddress');
billingAddress.setAttribute('class', 'editable');
var billingAddressBox = document.getElementById('billingAddress');

//RA number selector
document.querySelector('#prices1 > td:nth-child(2)').setAttribute('id', 'ra_number');
ra_number.setAttribute('class', 'editable');

//bottom RA number selector
document.querySelector('body > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(8) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(5) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1)').setAttribute('id', 'ra_number_bottom');

//Shipping method selector
document.querySelector('body > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(5) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)').setAttribute('id', 'shippingMethod');
shippingMethod.setAttribute('class', 'editable');

//Warranty packing slip text selector
document.querySelector('body > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > strong:nth-child(1)').setAttribute('id', 'warrantyPackingSlipText');

//date selector
document.querySelector('#prices2 > td:nth-child(2)').setAttribute('id', 'slipDate');
slipDate.setAttribute('class', 'editable');

//shipping address label text selector
document.querySelector('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(3) > td:nth-child(2) > table > tbody > tr > td.main').setAttribute('id', 'shippingAddressLabel');


//make non-dynamic boxes editable
shippingAddressBox.addEventListener('click', editShippingAddress);
billingAddressBox.addEventListener('click', editBillingAddress);
ra_number.addEventListener('click', editRANumber);
slipDate.addEventListener('click', editSlipDate);
shippingMethod.addEventListener('click', editShippingMethod);


//add styling (hover highlighting, etc)
var styling = document.createElement('style');
styling.innerHTML = '.editable:hover{background-color:#33ccff;}' //non-table edit field hover colour
+ '.dataTableContent:hover{background-color:#33ccff;}' //edit table button colour
+ '.dataTableRow td:nth-of-type(1):hover{background-color:#11CC44;}' //new row button hover colour
+ '.dataTableRow td:nth-of-type(2):hover{background-color:#CC1122;}' //delete row button hover colour
+ '.dataTableRow td:nth-of-type(1):hover input[type="checkbox"]{visibility:hidden;}'
+ '.dataTableRow td:nth-of-type(2):hover input[type="checkbox"]{visibility:hidden;}'
+ '.dataTableRow td:nth-of-type(4):hover{background-color:#FF9933; width:50px}' //copy/paste button hover colour
+ '.dataTableRow td:nth-of-type(1), .dataTableRow td:nth-of-type(2), .dataTableRow td:nth-of-type(4) {display: table-cell; position: relative}'
+ '.dataTableRow td .tooltiptext {visibility: hidden; visibility: hidden; width: 100px; background-color: #000;  color: #fff; text-align: center; border-radius: 6px; padding: 5px 0; position: absolute; z-index: 1; bottom: 120%; left: 40%; margin-left: -50px; pointer-events: none;}'
+ '.dataTableRow td:nth-of-type(1) .tooltiptext {}' 
+ '.dataTableRow td:nth-of-type(2) .tooltiptext {width: 80px; margin-left: -37px}' 
+ '.dataTableRow td:nth-of-type(4) .tooltiptext {width: 110px}' 
+ '.dataTableRow .tooltiptext::after {content: " "; position: absolute; top: 100%; left: 50%; margin-left: -5px; border-width: 5px; border-style: solid; border-color: #000 transparent transparent transparent; pointer-events: none;}'
+ '.dataTableRow td:hover .tooltiptext {visibility: visible;}';
document.body.appendChild(styling);




//handlers to manage click listeners
var tableListenerHandler = [];
var addRowListenerHandler = [];
var deleteRowListenerHandler = [];
var tableElements = document.getElementsByClassName('dataTableContent');


//initialise table
makeTableElementsClickable();
updateTableCheckboxButtons();
addTooltips();


shippingAddressLabel.addEventListener('click', function(){GM_setClipboard(shippingAddress.textContent);});


//FUNCTIONS
function addTooltips() {
  var addNewRowButtons = document.querySelectorAll('.dataTableRow td:nth-of-type(1)');
  var deleteRowButtons = document.querySelectorAll('.dataTableRow td:nth-of-type(2)');
  var copyPasteButtons = document.querySelectorAll('.dataTableRow td:nth-of-type(4)');
  
  for (i = 0; i < addNewRowButtons.length; i++) {
    var tooltip = document.createElement('span');
    tooltip.setAttribute('class', 'tooltiptext');
    tooltip.textContent = 'Duplicate row';
    addNewRowButtons[i].appendChild(tooltip);
  }
  
  for (i = 0; i < deleteRowButtons.length; i++) {
    var tooltip = document.createElement('span');
    tooltip.setAttribute('class', 'tooltiptext');
    tooltip.textContent = 'Delete row';
    deleteRowButtons[i].appendChild(tooltip);
  }
  
  for (i = 0; i < copyPasteButtons.length; i++) {
    var tooltip = document.createElement('span');
    tooltip.setAttribute('class', 'tooltiptext');
    tooltip.textContent = 'Copy/paste row';
    copyPasteButtons[i].appendChild(tooltip);
  }
}

//duplicates row to the product table (row index to duplicate as argument)
function addNewRow(){
  removeTableElementListeners();
  removeCurrentCheckboxButtonListeners();
 
  var rowIndex = arguments[0];
  var currentRow = document.querySelectorAll('.dataTableRow')[rowIndex];
  var newRow = document.createElement('tr');
  var tableElement = currentRow.parentElement;
  var rowHTML = currentRow.innerHTML;
  
  if(arguments[1]) {
    var rowString = arguments[1];
    rowString.trim();
    if(rowString.startsWith('<tr') && rowString.endsWith('</tr>')){
        rowString.replace('<tr>', '');
        rowString.replace('</tr', '');
        rowHTML = rowString;
      }
    else alert('Invalid code! \n\nCode must start with \"<tr\" and end with \"</tr>\"');
  }
  
  newRow.setAttribute('class', 'dataTableRow');
  newRow.innerHTML = rowHTML;
  tableElement.insertBefore(newRow, currentRow.nextSibling);
  updateTableCheckboxButtons();
  makeTableElementsClickable();
}

//deletes row from the product table (row index argument)
function deleteRow(){
  removeCurrentCheckboxButtonListeners();
  removeTableElementListeners();
  var rowIndex = arguments[0];
  var currentRow = document.querySelectorAll('.dataTableRow')[rowIndex];
  var tableElement = currentRow.parentElement;
  tableElement.removeChild(currentRow);
  updateTableCheckboxButtons();
  makeTableElementsClickable();
}

//makes table elements clickable
//adds click listeners to each element in tableElements[] which calls editTableElement()
function makeTableElementsClickable() {
  var i;
  for (i = 0; i < tableElements.length; i++) {
    const elementIndex = i;
    tableListenerHandler[elementIndex] = function(){editTableElement(elementIndex);};
    tableElements[elementIndex].addEventListener('click', tableListenerHandler[elementIndex]);
  }
}

//removes all click listeners from elements in tablElements[]
function removeTableElementListeners() {
  var i;
  for (i = 0; i < tableElements.length; i++) {
    const elementIndex = i;
    tableElements[elementIndex].removeEventListener('click', tableListenerHandler[elementIndex]);
  }
}

//adds click listeners to the checkboxes in the table and assigns the left checkbox to addNewRow(), and the right checkbox to deleteRow().
function updateTableCheckboxButtons() {
  var checkboxes = document.querySelectorAll('.dataTableRow td:nth-of-type(1)');
  for (i = 0; i < checkboxes.length; i++) {
    const elementIndex = i;
    addRowListenerHandler[elementIndex] = function(){addNewRow(elementIndex);};
    checkboxes[elementIndex].addEventListener('click', addRowListenerHandler[elementIndex]);
  }
  checkboxes = document.querySelectorAll('.dataTableRow td:nth-of-type(2)');
  for (i = 0; i < checkboxes.length; i++) {
    const elementIndex = i;
    deleteRowListenerHandler[elementIndex] = function(){deleteRow(elementIndex);};
    checkboxes[elementIndex].addEventListener('click', deleteRowListenerHandler[elementIndex]);
  }
  
}

//removes all checkbox listeners
function removeCurrentCheckboxButtonListeners() {
  var checkboxes = document.querySelectorAll('.dataTableRow td:nth-of-type(1)');
  for (i = 0; i < checkboxes.length; i++) {
    const elementIndex = i;
    checkboxes[elementIndex].removeEventListener('click', addRowListenerHandler[elementIndex]);
  }
  checkboxes = document.querySelectorAll('.dataTableRow td:nth-of-type(2)');
  for (i = 0; i < checkboxes.length; i++) {
    const elementIndex = i;
    checkboxes[elementIndex].removeEventListener('click', deleteRowListenerHandler[elementIndex]);
  }
}



function editShippingMethod() {
  shippingMethod.removeEventListener('click', editShippingMethod);
  var newForm = document.createElement('form');
  var selectionBox = document.createElement('select');
  selectionBox.setAttribute('id', 'shippingSelectionBox');
  var dummy_option = document.createElement('option');
  var EPS_option = document.createElement('option');
  var EPSPP_option = document.createElement('option');
  var EPE_option = document.createElement('option');
  var STS_option = document.createElement('option');
  var STE_option = document.createElement('option');
  var SPU_option = document.createElement('option');
  dummy_option.text = '** Select shipping method **';
  EPS_option.text = 'eParcel Standard';
  EPSPP_option.text = 'eParcel PP Standard';
  EPE_option.text = 'eParcel Express';
  STS_option.text = 'Startrack Standard';
  STE_option.text = 'Startrack Express';
  SPU_option.text = 'Store Pick Up';
  selectionBox.add(dummy_option);
  selectionBox.add(EPS_option);
  selectionBox.add(EPSPP_option);
  selectionBox.add(EPE_option);
  selectionBox.add(STS_option);
  selectionBox.add(STE_option);
  selectionBox.add(SPU_option);
  
  shippingMethod.innerHTML = '';
  shippingMethod.appendChild(selectionBox);
  
  selectionBox.focus();
  selectionBox.addEventListener('blur', saveShippingMethod);
  selectionBox.addEventListener('change', saveShippingMethod);
}

function saveShippingMethod() {
  var selectedOptionText = shippingSelectionBox.value;
  if (selectedOptionText == '** Select shipping method **') selectedOptionText = 'eParcel Standard';
  shippingMethod.innerHTML = selectedOptionText;
  
  if (selectedOptionText == 'eParcel Standard') warrantyPackingSlipText.innerHTML = 'Warranty Packing Slip - eP S';
  else if (selectedOptionText == 'eParcel PP Standard') warrantyPackingSlipText.innerHTML = 'Warranty Packing Slip - eP S PP';
  else if (selectedOptionText == 'eParcel Express') warrantyPackingSlipText.innerHTML = 'Warranty Packing Slip - eP E';
  else if (selectedOptionText == 'Startrack Standard') warrantyPackingSlipText.innerHTML = 'Warranty Packing Slip - ST S';
  else if (selectedOptionText == 'Startrack Express') warrantyPackingSlipText.innerHTML = 'Warranty Packing Slip - ST E';
  else if (selectedOptionText == 'Store Pick Up') {
    warrantyPackingSlipText.innerHTML = 'Warranty Packing Slip';
    shippingAddress.innerHTML = '<b>>>STORE PICKUP<<</b>'; }
  else warrantyPackingSlipText.innerHTML = 'Warranty Packing Slip';
  
  shippingMethod.addEventListener('click', editShippingMethod);
}


function editTableElement() {
  const currentElement = arguments[0];
  tableElements[currentElement].removeEventListener('click', tableListenerHandler[currentElement]); //may not work
  var newTextBox = document.createElement('input');
  var currentText = '';
  
  //make copy/paste column show whole row HTML
  if ((currentElement - 1) % 8 === 0) currentText = '<tr class="dataTableRow">' + tableElements[currentElement].parentNode.innerHTML.trim() + '</tr>';
  else currentText = tableElements[currentElement].innerHTML;
  
  newTextBox.setAttribute('type', 'text');
  newTextBox.setAttribute('value', currentText);
  newTextBox.size = tableElements[currentElement].clientWidth / 8;
  //alert(tableElements[currentElement].clientWidth);
  tableElements[currentElement].innerHTML = '';
  tableElements[currentElement].appendChild(newTextBox);
  newTextBox.select();
  newTextBox.addEventListener('blur', function(){saveTableElement(currentElement);});
}

function saveTableElement() {
  
  const elementIndex = arguments[0];
  var inputText = tableElements[elementIndex].firstChild.value;
  
  if ((elementIndex - 1) % 8 === 0) {
    var row = Math.floor(elementIndex / 8);
    tableElements[elementIndex].innerHTML = '&nbsp;';
    addNewRow(row, inputText);
    deleteRow(row);
  }
  else {
    if ((elementIndex + 1) % 8 == 0 && inputText.includes('<b>') == false) inputText = inputText.bold();
    tableElements[elementIndex].innerHTML = inputText;
    tableElements[elementIndex].addEventListener('click', tableListenerHandler[elementIndex]);
  }
}

function editRANumber() {
  ra_number.removeEventListener('click', editRANumber);
  var currentText = this.textContent;
  var newTextBox = document.createElement('input');
  
  newTextBox.setAttribute('id', 'raNumField');
  newTextBox.setAttribute('type', 'text');
  newTextBox.setAttribute('value', currentText);
  ra_number.innerHTML = '';
  ra_number.appendChild(newTextBox);
  newTextBox.select();
  newTextBox.addEventListener('blur', saveRANumber);
}

function editSlipDate() {
  slipDate.removeEventListener('click', editSlipDate);
  var currentText = this.textContent;
  var newTextBox = document.createElement('input');
  
  newTextBox.setAttribute('id', 'slipDateField');
  newTextBox.setAttribute('type', 'text');
  newTextBox.setAttribute('value', currentText);
  slipDate.innerHTML = '';
  slipDate.appendChild(newTextBox);
  newTextBox.select();
  newTextBox.addEventListener('blur', saveSlipDate);
}

function editShippingAddress() {
  shippingAddressBox.removeEventListener('click', editShippingAddress);
  var currentHTML = this.innerHTML;
  var newForm = document.createElement('form');
  var newTextArea = document.createElement('textarea');

  newTextArea.setAttribute('id', 'shippingAddressField');
  newTextArea.setAttribute('rows', '5');
  newTextArea.setAttribute('cols', '15');
  newTextArea.setAttribute('style', 'resize:none');
  newTextArea.appendChild(document.createTextNode(currentHTML));
  newForm.appendChild(newTextArea);
  shippingAddressBox.innerHTML = '';
  shippingAddressBox.appendChild(newForm);
  newTextArea.select();
  newTextArea.addEventListener('blur', saveShippingAddress);
}

function editBillingAddress() {
  billingAddressBox.removeEventListener('click', editBillingAddress);
  var currentHTML = this.innerHTML;
  var newForm = document.createElement('form');
  var newTextArea = document.createElement('textarea');

  newTextArea.setAttribute('id', 'billingAddressField');
  newTextArea.setAttribute('rows', '5');
  newTextArea.setAttribute('cols', '5');
  newTextArea.setAttribute('style', 'resize:none');
  newTextArea.appendChild(document.createTextNode(currentHTML));
  newForm.appendChild(newTextArea);
  billingAddressBox.innerHTML = '';
  billingAddressBox.appendChild(newForm);
  newTextArea.select();
  newTextArea.addEventListener('blur', saveBillingAddress);
}

function saveShippingAddress() {
  var newText = shippingAddressField.value;
  //newText = newText.split("\n").join("<br>"); //ALT METHOD
  newText = newText.replace(new RegExp('\r?\n','g'), '<br />');
  
  while (shippingAddressBox.hasChildNodes()) {
    shippingAddressBox.removeChild(shippingAddressBox.firstChild);
  }
  
  shippingAddressBox.innerHTML = newText;
  shippingAddress.addEventListener('click', editShippingAddress);
}

function saveBillingAddress() {
  var newText = billingAddressField.value;
  //newText = newText.split("\n").join("<br>"); //ALT METHOD
  newText = newText.replace(new RegExp('\r?\n','g'), '<br />');
  
  while (billingAddressBox.hasChildNodes()) {
    billingAddressBox.removeChild(billingAddressBox.firstChild);
  }
  
  billingAddressBox.innerHTML = newText;
  billingAddress.addEventListener('click', editBillingAddress);
}

function saveRANumber() {
  var inputText = raNumField.value;
  ra_number.innerHTML = inputText;
  ra_number_bottom.innerHTML = 'RA #: '.concat(inputText);
  ra_number.addEventListener('click', editRANumber);
}

function saveSlipDate() {
  slipDate.innerHTML = slipDateField.value;
  slipDate.addEventListener('click', editSlipDate);
}

function alert2() {
  alert('yay!');
}
