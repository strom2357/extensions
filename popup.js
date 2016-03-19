// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];
    window.tab = tab;

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var title = tab.title;

    // tab.title is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "title" properties.
    console.assert(typeof title == 'string', 'tab.title should be a string');

    callback(title);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var title;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   title = tabs[0].title;
  // });
  // alert(title); // Shows "undefined", because chrome.tabs.query is async.
}

/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */
function getImageUrl(searchTerm, callback, errorCallback) {
  // Google image search - 100 searches per day.
  // https://developers.google.com/image-search/
    console.log("getting image...");
  var searchUrl = 'http://api.riffsy.com/v1/search' +
    '?tag=' + encodeURIComponent(searchTerm);
  var x = new XMLHttpRequest();
  x.open('GET', searchUrl);
    console.log(x);
  // The Google image search API responds with JSON, so let Chrome parse it.
  x.responseType = 'json';
  x.onload = function() {
    // Parse and process the response from Google Image Search.
      window.response = x.response
      var response = x.response;
    if (!response || !response.results ||
        response.results.length === 0) {
      errorCallback('No response from Google Image search!');
      return;
    }
    var firstResult = response.results[0];
    // Take the thumbnail instead of the full image to get an approximately
    // consistent image size.
    console.log(firstResult);
    console.log(firstResult.media[0].keys);
    var imageKey = Object.keys(firstResult.media[0])[0];
    var image = firstResult.media[0][imageKey];
    var imageUrl = image.url;
    var width = parseInt(image.dims[0]);
    var height = parseInt(image.dims[1]);
    console.assert(
        typeof imageUrl == 'string' && !isNaN(width) && !isNaN(height),
        'Unexpected respose from the Google Image Search API!');
    callback(imageUrl, width, height);
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send();
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

var highlight = window.getSelection().toString();
console.log("HIGHLIGHT");
console.log(highlight);
window.highlight = highlight;

document.addEventListener('DOMContentLoaded', function() {
  var selection = window.getSelection
    window.wat = document;
  getCurrentTabUrl(function(title) {
    // Put the image URL in Google search.
    renderStatus('Performing Google Image search for ' + title);

    getImageUrl(title, function(imageUrl, width, height) {

      renderStatus('Search term: ' + title + '\n' +
          'Google image search result: ' + imageUrl);
      var imageResult = document.getElementById('image-result');
      // Explicitly set the width/height to minimize the number of reflows. For
      // a single image, this does not matter, but if you're going to embed
      // multiple external images in your page, then the absence of width/height
      // attributes causes the popup to resize multiple times.
      imageResult.width = width;
      imageResult.height = height;
      //imageResult.src = "https://en.wikipedia.org/wiki/" + title;
      imageResult.src = "https://stable.cerego.com/sets/740211/items/new?template_type=association_collection"

      imageResult.hidden = false;

    }, function(errorMessage) {
      renderStatus('Cannot display image. ' + errorMessage);
    });
  });
});
