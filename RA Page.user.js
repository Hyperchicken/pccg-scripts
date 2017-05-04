// ==UserScript==
// @name         RA Page Enhancements
// @namespace    www.hyperchicken.com
// @version      1.8
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
var serialnoElement = document.querySelector('#serialno');
var supplierRAElement = document.querySelector('#supplier_ra');
var pccgCommentTitle = document.querySelector('#warranty_edit > table > tbody > tr:nth-child(14) > td:nth-child(2) > span.formAreaTitle');
var topMenuBar = document.querySelector("body > table:nth-child(5) > tbody > tr:nth-child(1) > td");
var openLinkElement = document.querySelector('body > table:nth-child(5) > tbody > tr:nth-child(1) > td > a:nth-child(2)');
var PCCGCommentsElement = document.querySelector('#admin_note');
var raStatusElement = document.querySelector('#status');
var notifyCustomerCheckboxElement = document.querySelector('#notify');


var month = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

if(typeof products_id !== 'undefined') {
    document.title = 'RA ' + rano.value + ' - ' + products_id.nextElementSibling.textContent;
}
else {
    document.title = 'RA ' + rano.value + ' - ' + productDescription.textContent;
}


addCopyClipboardButton(productDescriptionElement);
addCopyClipboardButton(productCodeElement);
addCopyClipboardButton(serialnoElement);
addCopyClipboardButton(supplierRAElement);
addCopyClipboardButton(orderNumberElement);
addCopyClipboardButton(emailElement);
addCopyClipboardButton(rano);
addMarkInButton();
addEmailSearchButton();
addProductCodeSearchButton();
addAcrAutofillButton();
addEmailAutofillButton();

function addMarkInButton() {
    var buttonElement = document.createElement('a');
    var buttonText = document.createTextNode('Mark-in');
    buttonElement.setAttribute('class', 'topBarButton');
    buttonElement.setAttribute('id', 'markInAF');
    buttonElement.appendChild(buttonText);
    buttonElement.addEventListener('click', function(){markIn();});
    topMenuBar.insertBefore(buttonElement, openLinkElement.nextSibling);
}

function markIn(){
    var d = new Date();
    var thisButton = document.querySelector('#markInAF');
    supplierRAElement.value = ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + ' - Item Received';
    PCCGCommentsElement.value = 'Your item has been received and is in the queue for processing.';
    raStatusElement.value = 'Item received';
    notifyCustomerCheckboxElement.checked = false;
    supplierRAElement.style.borderColor = 'red';
    PCCGCommentsElement.style.borderColor = 'red';
    raStatusElement.style.borderColor = 'red';
    notifyCustomerCheckboxElement.previousElementSibling.style.textDecoration = 'underline';
    notifyCustomerCheckboxElement.previousElementSibling.style.textDecorationColor = 'red';
    thisButton.style.borderStyle = 'solid';
    thisButton.style.borderColor = 'red';
}

function addEmailSearchButton() {
    var email = emailElement.textContent;
    var buttonElement = document.createElement('a');
    var buttonText = document.createTextNode('RA Search');
    buttonElement.setAttribute('href', 'https://www.pccasegear.com/elgg/warranty_request.php?tech_name_sear=0&serialno1=&product_id=&name=&supplier_ra=&serialno=&status1=&return_reason=0&WarrantyEmail=' + email + '&Submit=Search');
    buttonElement.setAttribute('target', '_blank');
    buttonElement.setAttribute('class', 'linkButton');
    buttonElement.style.marginLeft = '20';
    buttonElement.appendChild(buttonText);
    emailElement.parentElement.appendChild(buttonElement);
}

function addAcrAutofillButton() {
    var buttonElement = document.createElement('a');
    var buttonText = document.createTextNode('Autofill: ACR');
    buttonElement.setAttribute('class', 'autofillButton');
    buttonElement.setAttribute('id', 'acrAF');
    buttonElement.style.marginLeft = '20';
    buttonElement.appendChild(buttonText);
    supplierRAElement.parentElement.appendChild(buttonElement);
    buttonElement.addEventListener('click', function(){acrAutofill();});
}

function acrAutofill() {
    var d = new Date();
    var thisButton = document.querySelector('#acrAF');
    supplierRAElement.value = 'ACR ' + month[d.getMonth()] + ' 0' + (Math.floor(Math.random() * 3) + 2);
    supplierRAElement.focus();
    supplierRAElement.style.borderColor = 'red';
    thisButton.style.borderStyle = 'solid';
    thisButton.style.borderColor = 'red';
}

function addEmailAutofillButton() {
    var buttonElement = document.createElement('a');
    var buttonText = document.createTextNode('Autofill: Email');
    buttonElement.setAttribute('class', 'autofillButton');
    buttonElement.setAttribute('id', 'emailAF');
    buttonElement.style.marginLeft = '20';
    buttonElement.appendChild(buttonText);
    emailElement.parentElement.appendChild(buttonElement);
    buttonElement.addEventListener('click', function(){emailAutofill();});
}

function emailAutofill() {
    var thisButton = document.querySelector('#emailAF');
    PCCGCommentsElement.value = 'We have sent an email to ' + emailElement.textContent + '.';
    raStatusElement.value = 'Awaiting customer response';
    notifyCustomerCheckboxElement.checked = false;
    PCCGCommentsElement.style.borderColor = 'red';
    raStatusElement.style.borderColor = 'red';
    notifyCustomerCheckboxElement.previousElementSibling.style.textDecoration = 'underline';
    notifyCustomerCheckboxElement.previousElementSibling.style.textDecorationColor = 'red';
    thisButton.style.borderStyle = 'solid';
    thisButton.style.borderColor = 'red';
}

function addProductCodeSearchButton() {
    if(productCodeElement === null) return;
    var productCode = productCodeElement.textContent;
    var buttonElement = document.createElement('a');
    var buttonText = document.createTextNode('Product Search');
    buttonElement.setAttribute('href', 'https://www.pccasegear.com/elgg/categories.php?search=' + productCode + '&search_include_disabled=1&search_model=1');
    buttonElement.setAttribute('target', '_blank');
    buttonElement.setAttribute('class', 'linkButton');
    buttonElement.style.marginLeft = '10';
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
    buttonElement.setAttribute('class', 'copyButton');
    buttonElement.appendChild(buttonText);
    buttonElement.addEventListener('click', function(){GM_setClipboard(elementText);});
    element.parentElement.appendChild(buttonElement);
}

var styling = document.createElement('style');
styling.innerHTML = '.linkButton{padding: 2px 3px 2px 3px; color: black;  border-width: 2px; border-radius: 4px; background-color: #b3ffcc; display: inline-block}' +
    '.linkButton:hover{color: black; text-decoration: none; background-color: #80ffaa;}' +
    '.linkButton:active{background-color: #33ff77;}' +
    '.copyButton{padding: 2px 3px 2px 3px;  border-width: 2px; color: black; border-radius: 4px; background-color: #e0ccff; cursor: default; display: inline-block}' +
    '.copyButton:hover{color: black; text-decoration: none; background-color: #d1b3ff;}' +
    '.copyButton:active{background-color: #b380ff;}' +
    '.topBarButton{margin: 3px 20px 3px 20px; font-size: 10pt; font-weight: bold; padding: 2px 3px 2px 3px; color: white;  border-width: 2px; border-radius: 4px; background-color: #0000ff; cursor: default}' +
    '.topBarButton:hover{color: white; text-decoration: none; background-color: #0000b3;}' +
    '.topBarButton:active{color: white; background-color: #6600cc;}' +
    '.autofillButton{padding: 2px 3px 2px 3px;  border-width: 2px; color: black; border-radius: 4px; background-color: #ffe8cc; cursor: default; display: inline-block}' +
    '.autofillButton:hover{color: black; text-decoration: none; background-color: #f9d5a8;}' +
    '.autofillButton:active{background-color: #f7c382;}';
document.body.appendChild(styling);
