import $ from 'jquery'
import Menu from './Menu';
import KeyCode from './KeyCode';

export default class SelectableMenu extends Menu {
    constructor(containerId, items) {
        super(containerId, items);
    }

    drawMenu() {
        this.$widgetButton = $('<button>', {
            'class': "btn btn-lg btn-primary ",
            'aria-haspopup': "true",
            'text': 'Menu button'
        })
        this.$widgetList = $('<ul>', {
            'role': 'menu',
            'aria-label': 'IE menu',
            'class': 'bg-white dropdown-menu',
            'style': 'display: block;' 
        });
        this.$widgetContainer.append(this.$widgetButton).append(this.$widgetList);

        this._addMenuItems();
        this._addEventListeners();
    }

    drawMenu_ie() {
        this.$widgetButton = $('<button>', {
            'class': "btn btn-lg btn-primary dropdown-toggle",
            'aria-haspopup': "true",
            'text': 'Menu button'
        })
        this.$widgetList = $('<ul>', {
            'role': 'menu',
            'aria-label': 'IE menu',
            'class': 'bg-white dropdown-menu',
            'style': 'display: block;' 
        });
        
        this.$widgetContainer.append(this.$widgetButton).append(this.$widgetList);

        this._addMenuItems_ie();
        this._addEventListeners();
    }

    _addMenuItems_ie() {
            this.items.forEach((item, index) => {
                let $menuItem = $('<li>', {
                    'text': item.text,
                    'class': 'my-2 pl-2 border-light border-bottom-0 border'
                });
                $menuItem.attr('role', 'menuitem');
                $menuItem.attr('tabindex', '0');
    
                //IE specific fix
                $menuItem.attr('aria-posinset', index+1);
                $menuItem.attr('aria-setsize', this.items.length);
    
                this.$widgetList
                // .append('<span class="dropdown-divider">')
                .append($menuItem);
                this.$dropdownItems.push($menuItem);
            });
        }
}

