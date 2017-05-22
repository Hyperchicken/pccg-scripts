// ==UserScript==
// @name         RA Page Enhancements
// @namespace    www.hyperchicken.com
// @version      1.12
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

var productId = getProductId();

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
//highlightQty();

//add check components button if a system RA
if(productDescription.textContent.toLowerCase().includes('pccg') && productDescription.textContent.toLowerCase().includes('system')) {
    loadSystemComponents();
    addSystemComponentsButton('System Components');
}
else if(productDescription.textContent.toLowerCase().includes('pccg') && productDescription.textContent.toLowerCase().includes('bundle')) {
    loadSystemComponents();
    addSystemComponentsButton('Bundle Contents');
}

function highlightQty(){
    var qtyArea = productCodeElement.parentNode;
    var qtyAreaText = qtyArea.textContent;
    var qtyIndex = qtyAreaText.indexOf('Qty:') + 5;
    var qty;
    qtyAreaText = qtyAreaText.slice(qtyIndex);
    var i = 0;
    var done = false;
    do{
        if(isNaN(qtyAreaText.charAt(i))) done = true;
        else{i++;}
    }while(!done);
    qty = qtyAreaText.substr(0, i);
}

function getProductId() {
    var hyperlink = productDescriptionElement.getAttributeNode('href').value;
    var index = hyperlink.lastIndexOf('products_id=');
    return hyperlink.substr(index + 'products_id='.length);
}

function addSystemComponentsButton(newButtonText) {
    var buttonElement = document.createElement('a');
    var dropdownDiv = document.createElement('div');
    var buttonText = document.createTextNode(newButtonText);
    dropdownDiv.setAttribute('class', 'dropdown');
    dropdownDiv.setAttribute('id', 'sysComponentsBox');
    buttonElement.setAttribute('class', 'funcButton bodyButton');
    buttonElement.setAttribute('id', 'sysComponentsBtn');
    dropdownDiv.appendChild(buttonElement);
    buttonElement.appendChild(buttonText);
    buttonElement.addEventListener('click', function(){if(document.querySelector('#dropdownBox') !== null) document.querySelector('#dropdownBox').style.display = 'block';});
    productDescriptionElement.parentElement.appendChild(dropdownDiv);
}

function loadSystemComponents() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var dropdownBox = document.createElement('div');
            var componentsHTML = xhr.responseXML.querySelectorAll('b~ul')[0];
            dropdownBox.setAttribute('class', 'dropdown-content');
            dropdownBox.setAttribute('id', 'dropdownBox');
            dropdownBox.style.display = 'none';
            var componentLinks = componentsHTML.getElementsByTagName('a');
            for (var i = 0; i < componentLinks.length; i++) {componentLinks[i].setAttribute('target', '_blank;');} //make links open in new tab
            dropdownBox.appendChild(componentsHTML);
            dropdownBox.addEventListener('mouseleave', function(){document.querySelector('#dropdownBox').style.display = 'none';});
            document.querySelector('#sysComponentsBox').appendChild(dropdownBox);
        }
        if (this.readyState == 4 && this.status != 200) document.getElementById('sysComponentsBtn').textContent = 'System Components (' + this.statusText + ')';
    };
    //xhr.open("GET", "Product Preview.htm", true); //testing code
    xhr.open("GET", "product.php?cPath=&pID=" + productId + "&action=new_product_preview&read=only&product_type=1&", true);
    xhr.responseType = "document";
    xhr.send();
}

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
    autofillSupplierRA(('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + ' - Item Received');
    autofillPCCGComment('Your item has been received and is in the queue for processing.');
    autofillStatus('Item received');
    thisButton.style.borderStyle = 'solid';
    thisButton.style.borderColor = 'red';
}

function addEmailSearchButton() {
    var email = emailElement.textContent;
    var buttonElement = document.createElement('a');
    var buttonText = document.createTextNode('RA Search');
    buttonElement.setAttribute('href', 'https://www.pccasegear.com/elgg/warranty_request.php?tech_name_sear=0&serialno1=&product_id=&name=&supplier_ra=&serialno=&status1=&return_reason=0&WarrantyEmail=' + email + '&Submit=Search');
    buttonElement.setAttribute('target', '_blank');
    buttonElement.setAttribute('class', 'linkButton bodyButton');
    buttonElement.appendChild(buttonText);
    emailElement.parentElement.appendChild(buttonElement);
}

function addAcrAutofillButton() {
    var buttonElement = document.createElement('a');
    var buttonText = document.createTextNode('Autofill: ACR');
    buttonElement.setAttribute('class', 'autofillButton bodyButton');
    buttonElement.setAttribute('id', 'acrAF');
    buttonElement.appendChild(buttonText);
    supplierRAElement.parentElement.appendChild(buttonElement);
    buttonElement.addEventListener('click', function(){acrAutofill();});
}

function acrAutofill() {
    alert('b');
    var d = new Date();
    var thisButton = document.querySelector('#acrAF');
    autofillSupplierRA('ACR ' + month[d.getMonth()] + ' 0' + (Math.floor(Math.random() * 3) + 2));
    supplierRAElement.select();
    thisButton.style.borderStyle = 'solid';
    thisButton.style.borderColor = 'red';
}

function addEmailAutofillButton() {
    var buttonElement = document.createElement('a');
    var buttonText = document.createTextNode('Autofill: Email');
    buttonElement.setAttribute('class', 'autofillButton bodyButton');
    buttonElement.setAttribute('id', 'emailAF');
    buttonElement.appendChild(buttonText);
    emailElement.parentElement.appendChild(buttonElement);
    buttonElement.addEventListener('click', function(){emailAutofill();});
}

function emailAutofill() {
    var thisButton = document.querySelector('#emailAF');
    autofillPCCGComment('We have sent an email to ' + emailElement.textContent + '.');
    autofillStatus('Awaiting customer response');
    thisButton.style.borderStyle = 'solid';
    thisButton.style.borderColor = 'red';
}

function autofillPCCGComment(newText) {
    PCCGCommentsElement.value = newText;
    PCCGCommentsElement.style.borderColor = 'red';
    document.getElementById('pccg-comment-btn').addEventListener('click', function(){PCCGCommentsElement.style.borderColor = '#00ff00';});
}

function autofillStatus(newStatus) {
    raStatusElement.value = newStatus;
    notifyCustomerCheckboxElement.checked = false;
    raStatusElement.style.borderColor = 'red';
    notifyCustomerCheckboxElement.previousElementSibling.style.textDecoration = 'underline';
    notifyCustomerCheckboxElement.previousElementSibling.style.textDecorationColor = 'red';
    document.getElementById('status-btn').addEventListener('click', function(){raStatusElement.style.borderColor = '#00ff00'; notifyCustomerCheckboxElement.previousElementSibling.style.textDecorationColor = '#00ff00';});
}

function autofillSupplierRA(newText) {
    supplierRAElement.value = newText;
    supplierRAElement.style.borderColor = 'red';
}

function addProductCodeSearchButton() {
    if(productCodeElement === null) return;
    var productCode = productCodeElement.textContent;
    var buttonElement = document.createElement('a');
    var buttonText = document.createTextNode('Product Search');
    buttonElement.setAttribute('href', 'https://www.pccasegear.com/elgg/categories.php?search=' + encodeURIComponent(productCode) + '&search_include_disabled=1&search_model=1');
    buttonElement.setAttribute('target', '_blank');
    buttonElement.setAttribute('class', 'linkButton bodyButton');
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
    buttonElement.setAttribute('class', 'copyButton bodyButton');
    buttonElement.appendChild(buttonText);
    buttonElement.addEventListener('click', function(){GM_setClipboard(elementText);});
    element.parentElement.appendChild(buttonElement);
}

var styling = document.createElement('style');
styling.innerHTML = '.bodyButton{margin-left: 10; padding: 2px 3px 2px 3px; color: black;  border-width: 2px; border-radius: 4px; display: inline-block;}' +
    '.bodyButton:hover{color: black;  text-decoration: none;}' +
    '.linkButton{background-color: #b3ffcc;}' +
    '.linkButton:hover{background-color: #80ffaa;}' +
    '.linkButton:active{background-color: #33ff77;}' +
    '.copyButton{background-color: #e0ccff; cursor: default;}' +
    '.copyButton:hover{background-color: #d1b3ff;}' +
    '.copyButton:active{background-color: #b380ff;}' +
    '.topBarButton{margin: 3px 20px 3px 20px; font-size: 10pt; font-weight: bold; padding: 2px 3px 2px 3px; color: white;  border-width: 2px; border-radius: 4px; background-color: #0000ff; cursor: default}' +
    '.topBarButton:hover{color: white; text-decoration: none; background-color: #0000b3;}' +
    '.topBarButton:active{color: white; background-color: #6600cc;}' +
    '.autofillButton{background-color: #ffe8cc; cursor: default;}' +
    '.autofillButton:hover{background-color: #ffd199;}' +
    '.autofillButton:active{background-color: #ffba66;}' +
    '.funcButton{background-color: #ffccee; cursor: default;}' +
    '.funcButton:hover{background-color: #ffb3e6;}' +
    '.funcButton:active{background-color: #ff80d5;}' +
    '.dropdown{position: relative; display: inline-block;}' +
    '.dropdown-content {display: none; position: absolute; background-color: #f9f9f9; min-width: 600px; box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2); padding: 5px 5px 5px 0px; z-index: 1;}';
document.body.appendChild(styling);
