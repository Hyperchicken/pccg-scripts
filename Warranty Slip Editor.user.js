// ==UserScript==
// @name        Warranty Slip Editor
// @namespace   http://hyperchicken.com
// @include     https://www.pccasegear.com/elgg/warranty_invoice.php?*
// @version     0.6
// @grant       none
// ==/UserScript==

//todo:
// -product table editing



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

shippingAddressBox.addEventListener('click', editShippingAddress);
billingAddressBox.addEventListener('click', editBillingAddress);
ra_number.addEventListener('click', editRANumber);
slipDate.addEventListener('click', editSlipDate);
shippingMethod.addEventListener('click', editShippingMethod);

//add hover effect
var styling = document.createElement('style');
styling.innerHTML = '.editable:hover{background-color:#00CCFF} .dataTableContent:hover{background-color:#00CCFF}'
document.body.appendChild(styling);



//table elements clickable
var i;
var tableElements = document.getElementsByClassName('dataTableContent');
var handler = [];
for (i = 0; i < tableElements.length; i++) {
  const elementIndex = i;
  const elementText = tableElements[i].innerHTML;
  handler[elementIndex] = function(){editTableElement(elementIndex)};
  tableElements[elementIndex].addEventListener('click', handler[elementIndex]);
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
  tableElements[currentElement].removeEventListener('click', handler[currentElement]); //may not work
  var currentText = tableElements[currentElement].innerHTML;
  var newTextBox = document.createElement('input');
  
  newTextBox.setAttribute('type', 'text');
  newTextBox.setAttribute('value', currentText);
  newTextBox.size = tableElements[currentElement].clientWidth / 8;
  //alert(tableElements[currentElement].clientWidth);
  tableElements[currentElement].innerHTML = '';
  tableElements[currentElement].appendChild(newTextBox);
  newTextBox.select();
  newTextBox.addEventListener('blur', function(){saveTableElement(currentElement)});
}

function saveTableElement() {
  
  const elementIndex = arguments[0];
  var inputText = tableElements[elementIndex].firstChild.value;
  if (elementIndex == 7) inputText = '<b>' + inputText + '</b>';
  tableElements[elementIndex].innerHTML = inputText;
  tableElements[elementIndex].addEventListener('click', handler[elementIndex]);
}

function editRANumber() {
  ra_number.removeEventListener('click', editRANumber);
  var currentText = this.textContent;
  var newTextBox = document.createElement('input');
  
  newTextBox.setAttribute('id', 'raNumField');
  newTextBox.setAttribute('type', 'text');
  newTextBox.setAttribute('value', currentText)
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
  newTextBox.setAttribute('value', currentText)
  slipDate.innerHTML = '';
  slipDate.appendChild(newTextBox);
  newTextBox.select();
  newTextBox.addEventListener('blur', saveSlipDate);
}

function editShippingAddress() {
  shippingAddressBox.removeEventListener('click', editShippingAddress);
  var currentHTML = this.innerHTML;
  var newForm = document.createElement('form')
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
  var newForm = document.createElement('form')
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
  shippingAddress.addEventListener('click', editShippingAddress)
}

function saveBillingAddress() {
  var newText = billingAddressField.value;
  //newText = newText.split("\n").join("<br>"); //ALT METHOD
  newText = newText.replace(new RegExp('\r?\n','g'), '<br />');
  
  while (billingAddressBox.hasChildNodes()) {
    billingAddressBox.removeChild(billingAddressBox.firstChild);
  }
  
  billingAddressBox.innerHTML = newText;
  billingAddress.addEventListener('click', editBillingAddress)
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

function alert3() {
  alert(arguments[0]);
}

function alert2() {
  alert('yay!');

}
