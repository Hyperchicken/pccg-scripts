// ==UserScript==
// @name         RA Page Enhancements
// @namespace    www.hyperchicken.com
// @version      2.1
// @description  Adds new buttons and features to warranty claim pages.
// @author       Petar Stankovic
// @match        https://www.pccasegear.com/elgg/warranty_request.php?*
// @match        http://localhost/RA%2090916%20-%20PCCG-AORUS1080TI.htm
// @grant        GM_setClipboard
// ==/UserScript==

var productDescriptionElement = document.querySelector('#warranty_edit > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(3) > a:nth-child(1)');
var productCodeElement = document.querySelector('#warranty_edit > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(3) > a:nth-child(2)');
var orderNumberElement = document.querySelector('#warranty_edit > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(13) > td:nth-child(2) > a:nth-child(1)');
var emailElement = document.querySelector('#warranty_edit > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(9) > td:nth-child(2) > a:nth-child(2)');
var serialnoElement = document.querySelector('#serialno');
var supplierRAElement = document.querySelector('#supplier_ra');
var pccgCommentTitle = document.querySelector('#warranty_edit > table > tbody > tr:nth-child(14) > td:nth-child(2) > span.formAreaTitle');
var topMenuBar = document.querySelector("body > table:nth-child(5) > tbody > tr:nth-child(1) > td");
var openLinkElement = document.querySelector('body > table:nth-child(5) > tbody > tr:nth-child(1) > td > a:nth-child(2)');
var PCCGCommentsElement = document.querySelector('#admin_note');
var raStatusElement = document.querySelector('#status');
var notifyCustomerCheckboxElement = document.querySelector('#notify');
var stockAdjustButton = document.querySelector('#warranty_edit > table > tbody > tr:nth-child(8) > td:nth-child(5) > img');
var sohArea = document.querySelector('#warranty_edit > table > tbody > tr:nth-child(8) > td:nth-child(5) > br:nth-child(5)');
var month = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
var claimId = document.querySelector('#claim_id').value;
var productId = getProductId();
loadClaimDetails();


//set Tab title text
if(typeof products_id !== 'undefined') {
    document.title = 'RA ' + rano.value + ' - ' + products_id.nextElementSibling.textContent;
}
else {
    document.title = 'RA ' + rano.value + ' - ' + productDescriptionElement.textContent;
}


//add script buttons and features
addCopyClipboardButton(productDescriptionElement);
addCopyClipboardButton(serialnoElement);
addCopyClipboardButton(supplierRAElement);
addCopyClipboardButton(orderNumberElement);
addCopyClipboardButton(emailElement);
addCopyClipboardButton(rano);
//addDistiButton();
addTestingAutofillButton();
addMarkInButton();
addEmailSearchButton();
addAcrAutofillButton();
addEmailAutofillButton();
//highlightQty();

//add check components button if a system RA or bundle
if(productDescriptionElement.textContent.toLowerCase().includes('pccg') && productDescriptionElement.textContent.toLowerCase().includes('system')) {
    loadSystemComponents();
    addSystemComponentsButton('System Components');
}
else if(productDescriptionElement.textContent.toLowerCase().includes('pccg') && productDescriptionElement.textContent.toLowerCase().includes('bundle')) {
    loadSystemComponents();
    addSystemComponentsButton('Bundle Contents');
}


function loadClaimDetails() { //pulls claim details from new module and executes scripts based on the received data
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var scriptText = xhr.responseXML.querySelector('head > script:nth-child(22)').innerHTML;
            var scriptEndIndex = scriptText.indexOf('window.categories');
            scriptText = scriptText.substr(20, scriptEndIndex - 26);
            console.log(scriptText); //PRINTS CLAIM DETAILS TO CONSOLE FOR DEV PURPOSES. Disable when complete
            window.claim = JSON.parse(scriptText);
            var w = window.claim.warranty; //alias for warranty claim details
            //+++++++++++ execute new code from here +++++++++++
            repairProductIds(w.products_id, w.products_model, w.quantity);
            displayStockOnHand(w.products_quantity, w.products_status, w.ETA_date, w.backorder_note, w.master_categories_id);
            //highlightQty(w.quantity);
            //+++++++++++ END new code execute +++++++++++
        }
    };
    //xhr.open("GET", "warr1_new_module.html", true); //testing code
    xhr.open("GET", "warranty_view.php?claim_id=" + claimId, true);
    xhr.responseType = "document";
    xhr.send();
}

function repairProductIds(pid, pcode, qty) {
    if(productCodeElement === null){
        productDescriptionElement.setAttribute('href', 'https://www.pccasegear.com/index.php?main_page=product_info&products_id=' + pid);
        productCodeArea = document.querySelector('#warranty_edit > table > tbody > tr:nth-child(3) > td:nth-child(3)');
        productCodeArea.innerHTML = '<td class="formAreaTitle" valign="top">Product Code <input name="products_id" id="products_id" value="' + pcode + '" style="border:0;  background-color:#ECFFFF;font-family:Verdana,sans-serif; font-size:11px" type="hidden"><a href="https://www.pccasegear.com/elgg/purchase.php?search=yes&amp;supplier=&amp;products_id=' + pid + '" target="_blank">' + pcode + '</a><span style="color:#33cc33" title="The script has fixed the product code link and stock adjust function as they were broken :("> **</span>&nbsp;&nbsp;&nbsp;Qty: ' + qty;
        productCodeElement = document.querySelector('#warranty_edit > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(3) > a:nth-child(2)');
        stockAdjustButton.setAttribute('onclick', "window.open( 'warranty_update_inventory.php?calim_id=80334&products_id=" + pid + "', 'myWindow', 'status = 1, height = 280, width = 400, left=500,top=200,resizable = 1' )");
    }
    else if (productCodeElement.textContent != pcode)
    {
        productCodeElement.style.color = 'red';
        productCodeElement.setAttribute('title', 'Script has determined this product code to be wrong or outdated. Product code should be: ' + pcode);
        productCodeElement.textContent = productCodeElement.textContent + ' | ' + pcode;
    }
    addCopyClipboardButton(productCodeElement);
    addProductCodeSearchButton();
}

function displayStockOnHand(quantity, listingEnabled, ETADate, backorderNote, productCategoryId) {
    var sohElement = document.createElement('span');
    var ETAElement = document.createElement('span');
    var sohTitleText = 'Stock On Hand: ' + quantity;
    sohElement.innerHTML = '<b> SOH: ' + quantity + '</b>';
    sohElement.style.float = 'right';
    if(!listingEnabled) {
        sohElement.style.textDecoration = 'line-through';
        sohElement.style.textDecorationColor = 'red';
        sohTitleText = sohTitleText + ' [LISTING INACTIVE]';
    }
    sohElement.setAttribute('title', sohTitleText);
    sohArea.parentElement.appendChild(sohElement);
    if(listingEnabled && quantity <= 0 && productCategoryId != '513') {
        ETAElement.innerHTML = '<b>ETA: </b>' + ETADate;
        ETAElement.style.float = 'right';
        ETAElement.setAttribute('title', 'Backorder Note: ' + backorderNote);
        sohArea.parentElement.appendChild(document.createElement('br'));
        sohArea.parentElement.appendChild(ETAElement);
    }
}

function highlightQty(qty){
    qty = 2;
    var qtyArea = productCodeElement.parentNode; //wont work if pid is broken
    if(qty > 1) {
        qtyArea.textContent.replace('Qty:', "<div style='{color: red}'>Qty:</div>");
    }
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

function addDistiButton() {
    var dropdownDiv = document.createElement('div');
    var dropdownContentDiv = document.createElement('div');
    var buttonElement = document.createElement('a');
    var buttonText = document.createTextNode('Disti Inc');
    var link1 = document.createElement('a');
    var link1Text = document.createTextNode('Return to Stock');
    var link2 = document.createElement('a');
    var link2Text = document.createTextNode('Ship From Warranties');
    var link3 = document.createElement('a');
    var link3Text = document.createTextNode('Ship From Warehouse');
    link1.appendChild(link1Text);
    link2.appendChild(link2Text);
    link3.appendChild(link3Text);
    buttonElement.setAttribute('class', 'topBarButton');
    buttonElement.setAttribute('id', 'distiAF');
    buttonElement.appendChild(buttonText);
    dropdownDiv.setAttribute('class', 'topBarDropdown');
    dropdownContentDiv.setAttribute('class', 'topBarDropdown-content');
    dropdownContentDiv.appendChild(link1);
    dropdownContentDiv.appendChild(link2);
    dropdownContentDiv.appendChild(link3);
    dropdownDiv.appendChild(buttonElement);
    dropdownDiv.appendChild(dropdownContentDiv);
    link1.addEventListener('click', function(){distiIncRTS();});
    link2.addEventListener('click', function(){distiIncShipFromWarranties();});
    link3.addEventListener('click', function(){distiIncShipFromWarehouse();});
    topMenuBar.insertBefore(dropdownDiv, openLinkElement.nextSibling);
}

function distiIncRTS() {
    alert('1');
}

function distiIncShipFromWarranties() {
    alert('2');
}

function distiIncShipFromWarehouse() {
    alert('3');
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

function addTestingAutofillButton() {
    var buttonElement = document.createElement('a');
    var buttonText = document.createTextNode('Testing');
    buttonElement.setAttribute('class', 'topBarButton');
    buttonElement.setAttribute('id', 'testingAF');
    buttonElement.setAttribute('title', 'Autofill fields for moving claim to testing status.');
    buttonElement.appendChild(buttonText);
    buttonElement.addEventListener('click', function(){testingAutofill();});
    topMenuBar.insertBefore(buttonElement, openLinkElement.nextSibling);
}

function testingAutofill(){
    var d = new Date();
    var thisButton = document.querySelector('#testingAF');
    autofillSupplierRA(('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + ' - Testing');
    autofillPCCGComment('Your item has been received and the item is currently being tested.');
    autofillStatus('Testing');
    thisButton.style.borderStyle = 'solid';
    thisButton.style.borderColor = 'red';
}

function getDateDDMM(){
    var d = new Date();
    return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2);
}

function markIn(){
    var thisButton = document.querySelector('#markInAF');
    autofillSupplierRA(getDateDDMM() + ' - Item Received');
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
    var d = new Date();
    var thisButton = document.querySelector('#acrAF');
    autofillSupplierRA(getDateDDMM() + ' - ACR ' + month[d.getMonth()] + ' 0' + (Math.floor(Math.random() * 3) + 2));
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

//allows easier manipulation of URLs.
//https://www.thecodeship.com/web-development/javascript-url-object/
function urlObject(options) {
    "use strict";
    /*global window, document*/

    var url_search_arr,
        option_key,
        i,
        urlObj,
        get_param,
        key,
        val,
        url_query,
        url_get_params = {},
        a = document.createElement('a'),
        default_options = {
            'url': window.location.href,
            'unescape': true,
            'convert_num': true
        };

    if (typeof options !== "object") {
        options = default_options;
    } else {
        for (option_key in default_options) {
            if (default_options.hasOwnProperty(option_key)) {
                if (options[option_key] === undefined) {
                    options[option_key] = default_options[option_key];
                }
            }
        }
    }

    a.href = options.url;
    url_query = a.search.substring(1);
    url_search_arr = url_query.split('&');

    if (url_search_arr[0].length > 1) {
        for (i = 0; i < url_search_arr.length; i += 1) {
            get_param = url_search_arr[i].split("=");

            if (options.unescape) {
                key = decodeURI(get_param[0]);
                val = decodeURI(get_param[1]);
            } else {
                key = get_param[0];
                val = get_param[1];
            }

            if (options.convert_num) {
                if (val.match(/^\d+$/)) {
                    val = parseInt(val, 10);
                } else if (val.match(/^\d+\.\d+$/)) {
                    val = parseFloat(val);
                }
            }

            if (url_get_params[key] === undefined) {
                url_get_params[key] = val;
            } else if (typeof url_get_params[key] === "string") {
                url_get_params[key] = [url_get_params[key], val];
            } else {
                url_get_params[key].push(val);
            }

            get_param = [];
        }
    }

    urlObj = {
        protocol: a.protocol,
        hostname: a.hostname,
        host: a.host,
        port: a.port,
        hash: a.hash.substr(1),
        pathname: a.pathname,
        search: a.search,
        parameters: url_get_params
    };

    return urlObj;
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
    '.topBarDropdown{position: relative; display: inline-block;}' +
    '.topBarDropdown-content{display: none; position: absolute; background-color: #f9f9f9; min-width: 160px; box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2); z-index: 1;}' +
    '.topBarDropdown-content a{color: black; padding: 12px 16px; text-decoration: none; display: block;}' +
    '.topBarDropdown-content a:hover{background-color: #f1f1f1}' +
    '.topBarDropdown:hover .topBarDropdown-content{display: block;} ' +
    '.topBarDropdown:hover .topBarButton{background-color: #3e8e41;}' +
    '.autofillButton{background-color: #ffe8cc; cursor: default;}' +
    '.autofillButton:hover{background-color: #ffd199;}' +
    '.autofillButton:active{background-color: #ffba66;}' +
    '.funcButton{background-color: #ffccee; cursor: default;}' +
    '.funcButton:hover{background-color: #ffb3e6;}' +
    '.funcButton:active{background-color: #ff80d5;}' +
    '.dropdown{position: relative; display: inline-block;}' +
    '.dropdown-content {display: none; position: absolute; background-color: #f9f9f9; min-width: 600px; box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2); padding: 5px 5px 5px 0px; z-index: 1;}';
document.body.appendChild(styling);
