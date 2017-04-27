// ==UserScript==
// @name         RA Page Enhancements
// @namespace    www.hyperchicken.com
// @version      1.5
// @description  Adds new buttons and features to warranty claim pages.
// @author       Petar Stankovic
// @match        https://www.pccasegear.com/elgg/warranty_request.php?*
// @grant        GM_setClipboard
// ==/UserScript==

var productDescriptionElement = document.querySelector('#warranty_edit > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(3) > a:nth-child(1)');
var productCodeElement = document.querySelector('#warranty_edit > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(3) > a:nth-child(2)');
var orderNumberElement = document.querySelector('#warranty_edit > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(13) > td:nth-child(2) > a:nth-child(1)');
var productDescription = document.querySelector('#warranty_edit > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(3) > a:nth-child(1)');
var emailElement = document.querySelector('#warranty_edit > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(9) > td:nth-child(2) > a:nth-child(2)');
var pccgCommentTitle = document.querySelector('#warranty_edit > table > tbody > tr:nth-child(14) > td:nth-child(2) > span.formAreaTitle');

if(typeof products_id !== 'undefined') {
  document.title = 'RA ' + rano.value + ' - ' + products_id.nextElementSibling.textContent;
}
else {
  document.title = 'RA ' + rano.value + ' - ' + productDescription.textContent;
}


addCopyClipboardButton(productDescriptionElement);
addCopyClipboardButton(productCodeElement);
addCopyClipboardButton(serialno);
addCopyClipboardButton(orderNumberElement);
addCopyClipboardButton(emailElement);
addCopyClipboardButton(rano);
addEmailSearchButton();
addProductCodeSearchButton();


function addPccgCommentTemplateButton() {
    
}

function addEmailSearchButton() {
  var email = emailElement.textContent;
  var buttonElement = document.createElement('a');
  var buttonText = document.createTextNode('RA Search');
  buttonElement.setAttribute('href', 'https://www.pccasegear.com/elgg/warranty_request.php?tech_name_sear=0&serialno1=&product_id=&name=&supplier_ra=&serialno=&status1=&return_reason=0&WarrantyEmail=' + email + '&Submit=Search');
  buttonElement.setAttribute('target', '_blank');
  buttonElement.setAttribute('class', 'greenButton');
  buttonElement.style.marginLeft = '20';
  //buttonElement.style.color = '#3c3';
  buttonElement.appendChild(buttonText);
  emailElement.parentElement.appendChild(buttonElement);
}

function addProductCodeSearchButton() {
  if(productCodeElement === null) return;
  var productCode = productCodeElement.textContent;
  var buttonElement = document.createElement('a');
  var buttonText = document.createTextNode('Product Search');
  buttonElement.setAttribute('href', 'https://www.pccasegear.com/elgg/categories.php?search=' + productCode + '&search_include_disabled=1&search_model=1');
  buttonElement.setAttribute('target', '_blank');
  buttonElement.setAttribute('class', 'greenButton');
  buttonElement.style.marginLeft = '10';
  //buttonElement.style.color = '#3c3';
  buttonElement.appendChild(buttonText);
  productCodeElement.parentElement.appendChild(buttonElement);
}

function addCopyClipboardButton(element) {
  if(element === null) return;
  var elementText = '';
  var buttonElement = document.createElement('a');
  var buttonText = document.createTextNode('Copy');
  if(element.nodeName == 'INPUT') elementText = element.value;
  else elementText = element.textContent;
  buttonElement.style.marginLeft = '20';
  buttonElement.setAttribute('class', 'redButton');
  //buttonElement.setAttribute('href', '#');
  //buttonElement.style.color = '#c00';
  buttonElement.appendChild(buttonText);
  buttonElement.addEventListener('click', function(){GM_setClipboard(elementText);});
  element.parentElement.appendChild(buttonElement);
}

var styling = document.createElement('style');
styling.innerHTML = '.greenButton{padding: 2px 3px 2px 3px; color: black;  border-width: 2px; border-radius: 4px; background-color: #b3ffcc}'
+ '.greenButton:hover{color: black; text-decoration: none; background-color: #80ffaa;}'
+ '.greenButton:active{background-color: #33ff77;}'
+ '.redButton{padding: 2px 3px 2px 3px;  border-width: 2px; color: black; border-radius: 4px; background-color: #e0ccff}'
+ '.redButton:hover{color: black; text-decoration: none; background-color: #d1b3ff;}'
+ '.redButton:active{background-color: #b380ff;}';
document.body.appendChild(styling);
