

# Testing node.js 
Test1: HTTP server, file, JSON, Redis



## Usage
HTTP server serves four tasks as following:<br>
1.přijme HTTP GET požadavek na routě /track <br>
2.získá data předaná jako query string parametry volání<br>
3.uloží data do souboru na lokálním disku jako JSON (append)<br>
4.pokud se v datech vyskytuje parametr count, zvýší o jeho hodnotu položku s klíčem 'count' v databázi Redis<br>

## Developing



### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.
