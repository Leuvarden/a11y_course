import $ from 'jquery'
import KeyCode from './KeyCode';
import FocusTrap from './FocusTrap';

export default class Menu {
    constructor(containerId, items) {
        this.items = items;
        this.$widgetContainer = $('#' + containerId);
        this.$dropdownItems = [];
    }

    //TODO: add bootstrap styles
    drawMenu() {
        this.$widgetButton = $('<button>', {
            'class':'btn btn-lg btn-primary',
            'aria-haspopup': 'true',
            'text': 'Dialog button',
            'type': 'button'
        })
        this.$widgetDiv = $('<div>', {
            'aria-label': 'Change Options',
            'style': 'display: block;',
            'role': 'dialog',
            'class': 'p-3 pr-6 form-group bg-white border border-dark'
        });
        this.$widgetContainer.append(this.$widgetButton).append(this.$widgetDiv);

        this._addMenuItems();

        this.$applyButton = $('<button class="btn btn-primary">Apply changes</button>')

        this.$widgetDiv.append('<div></div>').append(this.$applyButton);
        this.$closeButton = $('<button type="button" class="close" aria-label="Close">×</button>')
        this.$widgetDiv.append(this.$closeButton).prepend('<h4 id="dateWidgetH4">Change options</h4>');
        this._addEventListeners();
    }

    _addMenuItems() {
        this.items.forEach((item, index) => {
            let $menuItem = $('<input type="radio" name="dialogRadio" class="form-check-input">');
            if (item.isSelected) {
                $menuItem.attr('checked', '')
            }
            this.$dropdownItems.push($menuItem);

            let $label = $(`<label>${item.text}</label>`)
            $label.prepend($menuItem);
            let div = $('<div class="form-check"></div>');
            div.append($label);
            this.$widgetDiv.append(div);
            this.$widgetDiv.append(this.$applyButton);

        });
    }

    _addEventListeners() {
        this.$widgetButton.click(() => this.togglePopup())
        this.$widgetDiv.keydown((e) => this._handleKeydownOnDropdownItems(e))
        this.$closeButton.on('keydown', (e) => {
            if (e.keyCode === KeyCode.TAB) {
                this.$widgetButton.focus();
            }
        });

        this.$closeButton.on('click', () => {
            this.collapsePopup();
        })
    }

    togglePopup() {
        if (this.$widgetDiv.attr("aria-expanded")) {
            this.collapsePopup();
        } else {
            this.expandPopup();
        }
    }

    expandPopup() {
        this.$widgetDiv.css("display", "block");
        this.$widgetDiv.attr("aria-expanded", "true");
        this.$widgetDiv
            .find("input[checked]")
            .eq(0)
            .focus();
    }

    collapsePopup() {
        this.$widgetDiv.css("display", "none");
        this.$widgetDiv.removeAttr("aria-expanded");
        this.$widgetButton.focus();

    }

    _handleKeydownOnDropdownItems(event) {
        // let $currentItem = $(event.target);
        // let $firstItem = this.$dropdownItems[0];
        // let $lastItem = this.$dropdownItems[3];
        // let $previousItem = $(event.target).prev();
        // let $nextItem = $(event.target).next();

        switch (event.which) {
            case KeyCode.ESCAPE:
                this.collapsePopup();
                break;
        }
    }

}