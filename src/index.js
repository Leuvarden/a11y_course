import Menu from './Menu'
import selectableMenu from './selectableMenu';
import DialogMenu from './DialogMenu'
import ieMenu from './IeMenu'
import Grid from './Grid'
// import PillList from './pilList'
import $ from 'jquery';

import { ieSection, simpleMenuSection, selectMenuSection, DialogSection, GridSection, TableSection, PillSection } from './examplesSection'

const items = [
    {text: 'One', isSelected: false}, 
    {text: 'Two', isSelected: false}, 
    {text: 'Three', isSelected: true}, 
    {text: 'Four', isSelected: false}
    ]
    
let ie = new ieSection('1-ie')
let menuNoIe = new ieMenu ('ieContainer1', items)
let menuIe = new ieMenu ('ieContainer2', items)
menuNoIe.drawMenu()
menuIe.drawMenu_ie()

new simpleMenuSection('2-simpleMenu')
let menu = new Menu('menuContainer1', items);
menu.drawMenu()

new selectMenuSection('3-selectMenu')
let selectMenu = new selectableMenu('menuContainer2', items);
selectMenu.drawMenu()

new DialogSection('4-dialog')
let dialog = new DialogMenu('menuContainer3', items);
dialog.drawMenu()

new TableSection('5-table')

new GridSection('6-grid')
var ex2 = document.getElementById('ex2');
let grid = ex2.querySelector('[role="grid"]');
let icon = document.getElementById('gridIcon');
$(icon).hide();
var ex2Grid = new Grid(grid);
// $(document).on('keydown focus', (event) => {
//     if (grid.contains(document.activeElement)) {
//         $(icon).show();
//     } else {
//         $(icon).hide()
//     }
// })
// const gridItems = [
//     {text: 'Groceries', isSelected: false}, 
//     {text: 'Dining Out', isSelected: false}, 
//     {text: 'Household', isSelected: true}, 
//     {text: 'Auto', isSelected: false}
//     ]
// $('#ex2 td.menu-wrapper button').toArray().forEach((el, i) => {
//     let id = 'gridButton'+i;
//     $(el).attr('id', id);

//     let menu = new Menu(id, gridItems, true);
//     menu.drawMenu()
// })


// new PillSection('7-list')