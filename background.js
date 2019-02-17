/**
 * Returns the index of a given header object in the provided array
 * @param headerArray The Array to search in
 * @param newHeader The header to find
 * @return {int} The index of the header, or -1 if not found in the Array
 */
function getHeaderIndex(headerArray, newHeader) {

    for (var i = 0, len = headerArray.length; i < len; i++) {
        var currentHeader = headerArray[i];
        if (currentHeader.hasOwnProperty('name') && currentHeader.name == newHeader.name) {
            return i;
        }
    }

    return -1;
}

function mergeNewHeaders(originalHeaders, newHeaders) {
    //copy the headers for our own usage
    var mergedHeaders = originalHeaders.slice();
    for (var i = 0, len = newHeaders.length; i < len; i++) {
        var index = getHeaderIndex(mergedHeaders, newHeaders[i]);

        //if a matching header is defined, replace it
        //if not, add the new header to the end
        if (index > -1) {
            mergedHeaders[index] = newHeaders[i];
        } else {
            mergedHeaders.push(newHeaders[i]);
        }
    }

    return mergedHeaders;
}


/**
 * Responds to Chrome's onHeadersReceived event and injects all headers defined for the given URL
 * @param info {Object} Contains the request info
 * @see http://code.google.com/chrome/extensions/webRequest.html#event-onHeadersReceived
 */
function onHeadersReceivedHandler(details) {

    var desiredHeaders = [];
    gapi_url = "translation.googleapis.com";
    if(details.url.includes(gapi_url)) {
        desiredHeaders = [];
    } else {
        desiredHeaders = [{name: 'Access-Control-Allow-Origin', value: '*'}];
    }

    
    return { responseHeaders:mergeNewHeaders(details.responseHeaders, desiredHeaders) };
}

/**
 * Initializes the background page by retrieving settings and establishing the onHeadersReceived listener.
 * This method is called upon initialization, and also when the user changes settings on the Options page.
 */
function init() {

    chrome.webRequest.onHeadersReceived.addListener(
        onHeadersReceivedHandler,
        {urls: ["<all_urls>"]},
        ["blocking","responseHeaders"]
    );

    chrome.webRequest.onErrorOccurred.addListener(
        function(info){console.log('ForceCORS was unable to modify headers for: '+info.url +' - '+info.error)},
        {
            urls:["<all_urls>"]
        }
    );

    chrome.webRequest.handlerBehaviorChanged();
}

//make rocket go now!
init();