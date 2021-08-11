import {$} from './selector.js'
import './common.js'
import './class-functions/all.js'

window.$ = Object.freeze($);

// to allow detection of this module vs jquery
window.jqAlt = Object.freeze($);
