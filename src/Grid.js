// <!-- Simplified example https://www.w3.org/TR/wai-aria-practices-1.1/examples/grid/dataGrids.html-->


/**
 * @namespace aria
 */

var aria = aria || {};

aria.KeyCode = {
  BACKSPACE: 8,
  TAB: 9,
  RETURN: 13,
  ESC: 27,
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  DELETE: 46
};

aria.Utils = aria.Utils || {};

// Polyfill src https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
aria.Utils.matches = function (element, selector) {
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.matchesSelector ||
      Element.prototype.mozMatchesSelector ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.oMatchesSelector ||
      Element.prototype.webkitMatchesSelector ||
      function (s) {
        var matches = element.parentNode.querySelectorAll(s);
        var i = matches.length;
        while (--i >= 0 && matches.item(i) !== this) {}
        return i > -1;
      };
  }

  return element.matches(selector);
};

aria.Utils.remove = function (item) {
  if (item.remove && typeof item.remove === 'function') {
    return item.remove();
  }
  if (item.parentNode &&
      item.parentNode.removeChild &&
      typeof item.parentNode.removeChild === 'function') {
    return item.parentNode.removeChild(item);
  }
  return false;
};

aria.Utils.isFocusable = function (element) {
  if (element.tabIndex > 0 || (element.tabIndex === 0 && element.getAttribute('tabIndex') !== null)) {
    return true;
  }

  if (element.disabled) {
    return false;
  }

  switch (element.nodeName) {
    case 'A':
      return !!element.href && element.rel != 'ignore';
    case 'INPUT':
      return element.type != 'hidden' && element.type != 'file';
    case 'BUTTON':
    case 'SELECT':
    case 'TEXTAREA':
      return true;
    default:
      return false;
  }
};

aria.Utils.getAncestorBySelector = function (element, selector) {
  if (!aria.Utils.matches(element, selector + ' ' + element.tagName)) {
    // Element is not inside an element that matches selector
    return null;
  }

  // Move up the DOM tree until a parent matching the selector is found
  var currentNode = element;
  var ancestor = null;
  while (ancestor === null) {
    if (aria.Utils.matches(currentNode.parentNode, selector)) {
      ancestor = currentNode.parentNode;
    }
    else {
      currentNode = currentNode.parentNode;
    }
  }

  return ancestor;
};

aria.Utils.hasClass = function (element, className) {
  return (new RegExp('(\\s|^)' + className + '(\\s|$)')).test(element.className);
};

aria.Utils.addClass = function (element, className) {
  if (!aria.Utils.hasClass(element, className)) {
    element.className += ' ' + className;
  }
};

aria.Utils.removeClass = function (element, className) {
  var classRegex = new RegExp('(\\s|^)' + className + '(\\s|$)');
  element.className = element.className.replace(classRegex, ' ').trim();
};

/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*/

var aria = aria || {};


aria.SortType = {
  ASCENDING: 'ascending',
  DESCENDING: 'descending',
  NONE: 'none'
};

aria.GridSelector = {
  ROW: 'tr, [role="row"]',
  CELL: 'th, td, [role="gridcell"]',
  SCROLL_ROW: 'tr:not([data-fixed]), [role="row"]',
  SORT_HEADER: 'th[aria-sort]',
  TABBABLE: '[tabindex="0"]'
};

aria.CSSClass = {
  HIDDEN: 'hidden'
};

aria.Grid = function (gridNode) {
  this.navigationDisabled = false;
  this.gridNode = gridNode;
  this.paginationEnabled = this.gridNode.hasAttribute('data-per-page');
  this.shouldWrapCols = this.gridNode.hasAttribute('data-wrap-cols');
  this.shouldWrapRows = this.gridNode.hasAttribute('data-wrap-rows');
  this.shouldRestructure = this.gridNode.hasAttribute('data-restructure');
  this.topIndex = 0;

  this.keysIndicator = document.getElementById('arrow-keys-indicator');

  this.setupFocusGrid();
  this.setFocusPointer(0, 0);

  if (this.paginationEnabled) {
    this.setupPagination();
  }
  else {
    this.perPage = this.grid.length;
  }

  this.registerEvents();
};

aria.Grid.prototype.setupFocusGrid = function () {
  this.grid = [];

  Array.prototype.forEach.call(
    this.gridNode.querySelectorAll(aria.GridSelector.ROW),
    (function (row) {
      var rowCells = [];

      Array.prototype.forEach.call(
        row.querySelectorAll(aria.GridSelector.CELL),
        (function (cell) {
          var focusableSelector = '[tabindex]';

          if (aria.Utils.matches(cell, focusableSelector)) {
            rowCells.push(cell);
          }
          else {
            var focusableCell = cell.querySelector(focusableSelector);

            if (focusableCell) {
              rowCells.push(focusableCell);
            }
          }
        }).bind(this)
      );

      if (rowCells.length) {
        this.grid.push(rowCells);
      }
    }).bind(this)
  );

  if (this.paginationEnabled) {
    this.setupIndices();
  }
};

aria.Grid.prototype.setFocusPointer = function (row, col) {
  if (!this.isValidCell(row, col)) {
    return false;
  }

  if (this.isHidden(row, col)) {
    return false;
  }

  if (!isNaN(this.focusedRow) && !isNaN(this.focusedCol)) {
    this.grid[this.focusedRow][this.focusedCol].setAttribute('tabindex', -1);
  }

  this.grid[row][col]
    .removeEventListener('focus', this.showKeysIndicator.bind(this));
  this.grid[row][col]
    .removeEventListener('blur', this.hideKeysIndicator.bind(this));

  // Disable navigation if focused on an input
  this.navigationDisabled = aria.Utils.matches(this.grid[row][col], 'input');

  this.grid[row][col].setAttribute('tabindex', 0);
  this.focusedRow = row;
  this.focusedCol = col;

  this.grid[row][col]
    .addEventListener('focus', this.showKeysIndicator.bind(this));
  this.grid[row][col]
    .addEventListener('blur', this.hideKeysIndicator.bind(this));

  return true;
};

aria.Grid.prototype.isValidCell = function (row, col) {
  return (
    !isNaN(row) &&
    !isNaN(col) &&
    row >= 0 &&
    col >= 0 &&
    this.grid &&
    this.grid.length &&
    row < this.grid.length &&
    col < this.grid[row].length
  );
};

aria.Grid.prototype.isHidden = function (row, col) {
  var cell = this.gridNode.querySelectorAll(aria.GridSelector.ROW)[row]
    .querySelectorAll(aria.GridSelector.CELL)[col];
  return aria.Utils.hasClass(cell, aria.CSSClass.HIDDEN);
};

aria.Grid.prototype.clearEvents = function () {
  this.gridNode.removeEventListener('keydown', this.checkFocusChange.bind(this));
  this.gridNode.removeEventListener('keydown', this.delegateButtonHandler.bind(this));
  this.gridNode.removeEventListener('click', this.focusClickedCell.bind(this));
  this.gridNode.removeEventListener('click', this.delegateButtonHandler.bind(this));

  if (this.paginationEnabled) {
    this.gridNode.removeEventListener('keydown', this.checkPageChange.bind(this));
  }

  if (this.shouldRestructure) {
    window.removeEventListener('resize', this.checkRestructureGrid.bind(this));
  }

  this.grid[this.focusedRow][this.focusedCol]
    .removeEventListener('focus', this.showKeysIndicator.bind(this));
  this.grid[this.focusedRow][this.focusedCol]
    .removeEventListener('blur', this.hideKeysIndicator.bind(this));
};

aria.Grid.prototype.registerEvents = function () {
  this.clearEvents();

  this.gridNode.addEventListener('keydown', this.checkFocusChange.bind(this));
  this.gridNode.addEventListener('keydown', this.delegateButtonHandler.bind(this));
  this.gridNode.addEventListener('click', this.focusClickedCell.bind(this));
  this.gridNode.addEventListener('click', this.delegateButtonHandler.bind(this));

  if (this.paginationEnabled) {
    this.gridNode.addEventListener('keydown', this.checkPageChange.bind(this));
  }

  if (this.shouldRestructure) {
    window.addEventListener('resize', this.checkRestructureGrid.bind(this));
  }
};

aria.Grid.prototype.focusCell = function (row, col) {
  if (this.setFocusPointer(row, col)) {
    this.grid[row][col].focus();
  }
};

aria.Grid.prototype.showKeysIndicator = function () {
  if (this.keysIndicator) {
    aria.Utils.removeClass(this.keysIndicator, 'hidden');
  }
};

aria.Grid.prototype.hideKeysIndicator = function () {
  if (this.keysIndicator &&
      this.grid[this.focusedRow][this.focusedCol].tabIndex === 0) {
    aria.Utils.addClass(this.keysIndicator, 'hidden');
  }
};

aria.Grid.prototype.checkFocusChange = function (event) {
  if (!event || this.navigationDisabled) {
    return;
  }

  this.findFocusedItem(event.target);

  var key = event.which || event.keyCode;
  var rowCaret = this.focusedRow;
  var colCaret = this.focusedCol;
  var nextCell;

  switch (key) {
    case aria.KeyCode.UP:
      nextCell = this.getNextVisibleCell(0, -1);
      rowCaret = nextCell.row;
      colCaret = nextCell.col;
      break;
    case aria.KeyCode.DOWN:
      nextCell = this.getNextVisibleCell(0, 1);
      rowCaret = nextCell.row;
      colCaret = nextCell.col;
      break;
    case aria.KeyCode.LEFT:
      nextCell = this.getNextVisibleCell(-1, 0);
      rowCaret = nextCell.row;
      colCaret = nextCell.col;
      break;
    case aria.KeyCode.RIGHT:
      nextCell = this.getNextVisibleCell(1, 0);
      rowCaret = nextCell.row;
      colCaret = nextCell.col;
      break;
    case aria.KeyCode.HOME:
      if (event.ctrlKey) {
        rowCaret = 0;
      }
      colCaret = 0;
      break;
    case aria.KeyCode.END:
      if (event.ctrlKey) {
        rowCaret = this.grid.length - 1;
      }
      colCaret = this.grid[this.focusedRow].length - 1;
      break;
    default:
      return;
  }

  if (this.paginationEnabled) {
    if (rowCaret < this.topIndex) {
      this.showFromRow(rowCaret, true);
    }

    if (rowCaret >= this.topIndex + this.perPage) {
      this.showFromRow(rowCaret, false);
    }
  }

  this.focusCell(rowCaret, colCaret);
  event.preventDefault();
};

aria.Grid.prototype.findFocusedItem = function (focusedTarget) {
  var focusedCell = this.grid[this.focusedRow][this.focusedCol];

  if (focusedCell === focusedTarget ||
      focusedCell.contains(focusedTarget)) {
    return;
  }

  for (var i = 0; i < this.grid.length; i++) {
    for (var j = 0; j < this.grid[i].length; j++) {
      if (this.grid[i][j] === focusedTarget ||
          this.grid[i][j].contains(focusedTarget)) {
        this.setFocusPointer(i, j);
        return;
      }
    }
  }
};

aria.Grid.prototype.focusClickedCell = function (event) {
  var clickedGridCell = this.findClosest(event.target, '[tabindex]');

  for (var row = 0; row < this.grid.length; row++) {
    for (var col = 0; col < this.grid[row].length; col++) {
      if (this.grid[row][col] === clickedGridCell) {
        this.setFocusPointer(row, col);

        if (!aria.Utils.matches(clickedGridCell, 'button[aria-haspopup]')) {
          // Don't focus if it's a menu button (focus should be set to menu)
          this.focusCell(row, col);
        }

        return;
      }
    }
  }
};

aria.Grid.prototype.delegateButtonHandler = function (event) {
  var key = event.which || event.keyCode;
  var target = event.target;
  var isClickEvent = (event.type === 'click');

  if (!target) {
    return;
  }

  if (
    target.parentNode &&
    target.parentNode.matches('th[aria-sort]') &&
    (
      isClickEvent ||
      key === aria.KeyCode.SPACE ||
      key === aria.KeyCode.RETURN
    )
  ) {
    event.preventDefault();
    this.handleSort(target.parentNode);
  }

  if (
    aria.Utils.matches(target, '.editable-text, .edit-text-button') &&
    (
      isClickEvent ||
      key === aria.KeyCode.RETURN
    )
  ) {
    event.preventDefault();
    this.toggleEditMode(
      this.findClosest(target, '.editable-text'),
      true,
      true
    );
  }

  if (
    aria.Utils.matches(target, '.edit-text-input') &&
    (
      key === aria.KeyCode.RETURN ||
      key === aria.KeyCode.ESC
    )
  ) {
    event.preventDefault();
    this.toggleEditMode(
      this.findClosest(target, '.editable-text'),
      false,
      key === aria.KeyCode.RETURN
    );
  }
};

aria.Grid.prototype.toggleEditMode = function (editCell, toggleOn, updateText) {
  var onClassName = toggleOn ? 'edit-text-input' : 'edit-text-button';
  var offClassName = toggleOn ? 'edit-text-button' : 'edit-text-input';
  var onNode = editCell.querySelector('.' + onClassName);
  var offNode = editCell.querySelector('.' + offClassName);

  if (toggleOn) {
    onNode.value = offNode.innerText;
  }
  else if (updateText) {
    onNode.innerText = offNode.value;
  }

  aria.Utils.addClass(offNode, aria.CSSClass.HIDDEN);
  aria.Utils.removeClass(onNode, aria.CSSClass.HIDDEN);
  offNode.setAttribute('tabindex', -1);
  onNode.setAttribute('tabindex', 0);
  onNode.focus();
  this.grid[this.focusedRow][this.focusedCol] = onNode;
  this.navigationDisabled = toggleOn;
};

aria.Grid.prototype.handleSort = function (headerNode) {
  var columnIndex = headerNode.cellIndex;
  var sortType = headerNode.getAttribute('aria-sort');

  if (sortType === aria.SortType.ASCENDING) {
    sortType = aria.SortType.DESCENDING;
  }
  else {
    sortType = aria.SortType.ASCENDING;
  }

  var comparator = function (row1, row2) {
    var row1Text = row1.children[columnIndex].innerText;
    var row2Text = row2.children[columnIndex].innerText;
    var row1Value = parseInt(row1Text.replace(/[^0-9\.]+/g, ''));
    var row2Value = parseInt(row2Text.replace(/[^0-9\.]+/g, ''));

    if (sortType === aria.SortType.ASCENDING) {
      return row1Value - row2Value;
    }
    else {
      return row2Value - row1Value;
    }
  };

  this.sortRows(comparator);
  this.setupFocusGrid();

  Array.prototype.forEach.call(
    this.gridNode.querySelectorAll(aria.GridSelector.SORT_HEADER),
    function (headerCell) {
      headerCell.setAttribute('aria-sort', aria.SortType.NONE);
    }
  );

  headerNode.setAttribute('aria-sort', sortType);
};

aria.Grid.prototype.sortRows = function (compareFn) {
  var rows = this.gridNode.querySelectorAll(aria.GridSelector.ROW);
  var rowWrapper = rows[0].parentNode;
  var dataRows = Array.prototype.slice.call(rows, 1);

  dataRows.sort(compareFn);

  dataRows.forEach((function (row) {
    rowWrapper.appendChild(row);
  }).bind(this));
};

aria.Grid.prototype.setupIndices = function () {
  var rows = this.gridNode.querySelectorAll(aria.GridSelector.ROW);

  for (var row = 0; row < rows.length; row++) {
    var cols = rows[row].querySelectorAll(aria.GridSelector.CELL);
    rows[row].setAttribute('aria-rowindex', row + 1);

    for (var col = 0; col < cols.length; col++) {
      cols[col].setAttribute('aria-colindex', col + 1);
    }

  }
};

aria.Grid.prototype.setupPagination = function () {
  this.onPaginationChange = this.onPaginationChange || function () {};
  this.perPage = parseInt(this.gridNode.getAttribute('data-per-page'));
  this.showFromRow(0, true);
};

aria.Grid.prototype.setPaginationChangeHandler = function (onPaginationChange) {
  this.onPaginationChange = onPaginationChange;
};

aria.Grid.prototype.checkPageChange = function (event) {
  if (!event) {
    return;
  }

  var key = event.which || event.keyCode;

  if (key === aria.KeyCode.PAGE_UP) {
    event.preventDefault();
    this.movePageUp();
  }
  else if (key === aria.KeyCode.PAGE_DOWN) {
    event.preventDefault();
    this.movePageDown();
  }
};

aria.Grid.prototype.movePageUp = function () {
  var startIndex = Math.max(this.perPage - 1, this.topIndex - 1);
  this.showFromRow(startIndex, false);
  this.focusCell(startIndex, this.focusedCol);
};

aria.Grid.prototype.movePageDown = function () {
  var startIndex = this.topIndex + this.perPage;
  this.showFromRow(startIndex, true);
  this.focusCell(startIndex, this.focusedCol);
};

aria.Grid.prototype.showFromRow = function (startIndex, scrollDown) {
  var dataRows =
    this.gridNode.querySelectorAll(aria.GridSelector.SCROLL_ROW);
  var reachedTop = false;
  var firstIndex = -1;
  var endIndex = -1;

  if (startIndex < 0 || startIndex >= dataRows.length) {
    return;
  }

  for (var i = 0; i < dataRows.length; i++) {

    if (
      (
        scrollDown &&
        i >= startIndex &&
        i < startIndex + this.perPage) ||
        (
          !scrollDown &&
          i <= startIndex &&
          i > startIndex - this.perPage
        )
    ) {
      aria.Utils.removeClass(dataRows[i], aria.CSSClass.HIDDEN);

      if (!reachedTop) {
        this.topIndex = i;
        reachedTop = true;
      }

      if (firstIndex < 0) {
        firstIndex = i;
      }
      endIndex = i;
    }
    else {
      aria.Utils.addClass(dataRows[i], aria.CSSClass.HIDDEN);
    }
  }
  this.onPaginationChange(firstIndex, endIndex);
};

aria.Grid.prototype.checkRestructureGrid = function () {
  if (this.waitingToRestructure) {
    return;
  }

  this.waitingToRestructure = true;

  setTimeout(this.restructureGrid.bind(this), 300);
};

aria.Grid.prototype.restructureGrid = function () {
  this.waitingToRestructure = false;

  var gridWidth = this.gridNode.offsetWidth;
  var cells = this.gridNode.querySelectorAll(aria.GridSelector.CELL);
  var currentWidth = 0;

  var focusedElement = this.gridNode.querySelector(aria.GridSelector.TABBABLE);
  var shouldRefocus = (document.activeElement === focusedElement);
  var focusedIndex = (this.focusedRow * this.grid[0].length + this.focusedCol);

  var newRow = document.createElement('div');
  newRow.setAttribute('role', 'row');
  this.gridNode.innerHTML = '';
  this.gridNode.append(newRow);

  cells.forEach(function (cell, index) {
    var cellWidth = cell.offsetWidth;

    if (currentWidth > 0 && currentWidth >= (gridWidth - cellWidth)) {
      newRow = document.createElement('div');
      newRow.setAttribute('role', 'row');
      this.gridNode.append(newRow);
      currentWidth = 0;
    }

    newRow.append(cell);
    currentWidth += cellWidth;
  });

  this.setupFocusGrid();

  this.focusedRow = Math.floor(focusedIndex / this.grid[0].length);
  this.focusedCol = focusedIndex % this.grid[0].length;

  if (shouldRefocus) {
    this.focusCell(this.focusedRow, this.focusedCol);
  }
};

aria.Grid.prototype.getNextCell = function (
  currRow,
  currCol,
  directionX,
  directionY
) {
  var row = currRow + directionY;
  var col = currCol + directionX;
  var rowCount = this.grid.length;
  var isLeftRight = directionX !== 0;

  if (!rowCount) {
    return false;
  }

  var colCount = this.grid[0].length;

  if (this.shouldWrapCols && isLeftRight) {
    if (col < 0) {
      col = colCount - 1;
      row--;
    }

    if (col >= colCount) {
      col = 0;
      row++;
    }
  }

  if (this.shouldWrapRows && !isLeftRight) {
    if (row < 0) {
      col--;
      row = rowCount - 1;
      if (this.grid[row] && col >= 0 && !this.grid[row][col]) {
        // Sometimes the bottom row is not completely filled in. In this case,
        // jump to the next filled in cell.
        row--;
      }
    }
    else if (row >= rowCount || !this.grid[row][col]) {
      row = 0;
      col++;
    }
  }

  if (this.isValidCell(row, col)) {
    return {
      row: row,
      col: col
    };
  }
  else if (this.isValidCell(currRow, currCol)) {
    return {
      row: currRow,
      col: currCol
    };
  }
  else {
    return false;
  }
};

aria.Grid.prototype.getNextVisibleCell = function (directionX, directionY) {
  var nextCell = this.getNextCell(
    this.focusedRow,
    this.focusedCol,
    directionX,
    directionY
  );

  if (!nextCell) {
    return false;
  }

  var rowCount = this.grid.length;
  var colCount = this.grid[nextCell.row].length;

  while (this.isHidden(nextCell.row, nextCell.col)) {
    var currRow = nextCell.row;
    var currCol = nextCell.col;

    nextCell = this.getNextCell(currRow, currCol, directionX, directionY);

    if (currRow === nextCell.row && currCol === nextCell.col) {
      // There are no more cells to try if getNextCell returns the current cell
      return false;
    }
  }

  return nextCell;
};

aria.Grid.prototype.toggleColumn = function (columnIndex, isShown) {
  var cellSelector = '[aria-colindex="' + columnIndex + '"]';
  var columnCells = this.gridNode.querySelectorAll(cellSelector);

  Array.prototype.forEach.call(
    columnCells,
    function (cell) {
      if (isShown) {
        aria.Utils.removeClass(cell, aria.CSSClass.HIDDEN);
      }
      else {
        aria.Utils.addClass(cell, aria.CSSClass.HIDDEN);
      }
    }
  );

  if (!isShown && this.focusedCol === (columnIndex - 1)) {
    // If focus was set on the hidden column, shift focus to the right
    var nextCell = this.getNextVisibleCell(1, 0);
    if (nextCell) {
      this.setFocusPointer(nextCell.row, nextCell.col);
    }
  }
};

aria.Grid.prototype.findClosest = function (element, selector) {
  if (aria.Utils.matches(element, selector)) {
    return element;
  }

  if (aria.Utils.matches(element.parentNode, selector)) {
    return element.parentNode;
  }

  return element.querySelector(selector);
};

export default aria.Grid;
