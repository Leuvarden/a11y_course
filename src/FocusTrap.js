import $ from "jquery";

const focusableSelector = "a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]";

/*!
* Borrowed from https://github.com/julienw/jquery-trap-input
* Copyright (c) 2011, 2012 Julien Wajsberg <felash@gmail.com>
*/
function onkeypress(e) {
    if (e.keyCode === 9) {
        var goReverse = !!(e.shiftKey);
        if (processTab(this, e.target, goReverse)) {
            e.preventDefault();
            e.stopPropagation();
        }
    }
}

// will return true if we could process the tab event
// otherwise, return false
function processTab(container, elt, goReverse) {
    var $focussable = getFocusableElementsInContainer(container),
        curElt = elt,
        index, nextIndex, prevIndex, lastIndex;

    do {
        index = $focussable.index(curElt);
        nextIndex = index + 1;
        prevIndex = index - 1;
        lastIndex = $focussable.length - 1;

        switch (index) {
            case -1:
                return false; // that's strange, let the browser do its job
            case 0:
                prevIndex = lastIndex;
                break;
            case lastIndex:
                nextIndex = 0;
                break;
        }

        if (goReverse) {
            nextIndex = prevIndex;
        }

        curElt = $focussable.get(nextIndex);
        if (!curElt || curElt === elt) {
            return true;
        }

        try {
            curElt.focus();
        } catch (e) {
            // IE sometimes throws when an element is not visible
            return true;
        }

    } while ($focussable.length > 1 && elt === elt.ownerDocument.activeElement);

    return true;
}

function filterKeepSpeciallyFocusable() {
    return this.tabIndex > 0;
}

function filterKeepNormalElements() {
    return !this.tabIndex; // true if no tabIndex or tabIndex == 0
}

function sortFocusable(a, b) {
    return (a.t - b.t) || (a.i - b.i);
}

function getFocusableElementsInContainer(container) {
    var $container = $(container);

    var result = [],
        cnt = 0;

    $container.find(focusableSelector)
        .filter(":visible")
        .filter(filterKeepNormalElements)
        .each(function (i, val) {
            result.push({
                v: val, // value
                t: 0, // tabIndex
                i: cnt++ // index for stable sort
            });
        });

    $container
        .find("[tabindex]")
        .filter(":visible")
        .filter(filterKeepSpeciallyFocusable)
        .each(function (i, val) {
            result.push({
                v: val, // value
                t: val.tabIndex, // tabIndex
                i: cnt++ // index
            });
        });

    result = $.map(result.sort(sortFocusable), // needs stable sort
        function (val) {
            return val.v;
        }
    );


    return $(result);
}

export default onkeypress;