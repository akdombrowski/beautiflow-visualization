globalThis["webpackHotUpdatebeautiflow_visualization"]("main",{

/***/ "./src/cy.js":
/*!*******************!*\
  !*** ./src/cy.js ***!
  \*******************/
/***/ (() => {

throw new Error("Module build failed (from ./.yarn/__virtual__/babel-loader-virtual-53da973725/0/cache/babel-loader-npm-8.3.0-a5239d7ed2-d48bcf9e03.zip/node_modules/babel-loader/lib/index.js):\nSyntaxError: /home/adombrowski/workspace/beautiflow-visualization/src/cy.js: Identifier 'oldRootPosX' has already been declared. (826:14)\n\n\u001b[0m \u001b[90m 824 |\u001b[39m         \u001b[36mconst\u001b[39m oldRootPosX \u001b[33m=\u001b[39m cy\u001b[33m.\u001b[39m$(\u001b[32m\"#\"\u001b[39m \u001b[33m+\u001b[39m rootID)\u001b[33m.\u001b[39mposition(\u001b[32m\"x\"\u001b[39m)\u001b[0m\n\u001b[0m \u001b[90m 825 |\u001b[39m         \u001b[36mconst\u001b[39m oldRootPosY \u001b[33m=\u001b[39m cy\u001b[33m.\u001b[39m$(\u001b[32m\"#\"\u001b[39m \u001b[33m+\u001b[39m rootID)\u001b[33m.\u001b[39mposition(\u001b[32m\"y\"\u001b[39m)\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 826 |\u001b[39m         \u001b[36mconst\u001b[39m oldRootPosX \u001b[33m=\u001b[39m newRootPos\u001b[33m.\u001b[39mx\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m     |\u001b[39m               \u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 827 |\u001b[39m         \u001b[36mconst\u001b[39m oldRootPosY \u001b[33m=\u001b[39m newRootPos\u001b[33m.\u001b[39my\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 828 |\u001b[39m           cy\u001b[33m.\u001b[39mfit(nodesInCurrRowSection)\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 829 |\u001b[39m\u001b[0m\n    at instantiate (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:64:32)\n    at constructor (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:364:12)\n    at FlowParserMixin.raise (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:3253:19)\n    at FlowScopeHandler.checkRedeclarationInScope (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:1542:19)\n    at FlowScopeHandler.declareName (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:1513:12)\n    at FlowScopeHandler.declareName (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:1610:11)\n    at FlowParserMixin.declareNameFromIdentifier (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:7531:16)\n    at FlowParserMixin.checkIdentifier (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:7527:12)\n    at FlowParserMixin.checkLVal (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:7466:12)\n    at FlowParserMixin.parseVarId (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:13218:10)\n    at FlowParserMixin.parseVarId (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:5737:11)\n    at FlowParserMixin.parseVar (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:13191:12)\n    at FlowParserMixin.parseVarStatement (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:13031:10)\n    at FlowParserMixin.parseStatementContent (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12628:23)\n    at FlowParserMixin.parseStatementLike (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12548:17)\n    at FlowParserMixin.parseStatementLike (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:5135:24)\n    at FlowParserMixin.parseStatementListItem (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12528:17)\n    at FlowParserMixin.parseBlockOrModuleBlockBody (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:13120:61)\n    at FlowParserMixin.parseBlockBody (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:13113:10)\n    at FlowParserMixin.parseBlock (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:13101:10)\n    at FlowParserMixin.parseStatementContent (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12635:21)\n    at FlowParserMixin.parseStatementLike (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12548:17)\n    at FlowParserMixin.parseStatementLike (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:5135:24)\n    at FlowParserMixin.parseStatementOrSloppyAnnexBFunctionDeclaration (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12538:17)\n    at FlowParserMixin.parseIfStatement (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12920:28)\n    at FlowParserMixin.parseStatementContent (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12579:21)\n    at FlowParserMixin.parseStatementLike (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12548:17)\n    at FlowParserMixin.parseStatementLike (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:5135:24)\n    at FlowParserMixin.parseStatementOrSloppyAnnexBFunctionDeclaration (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12538:17)\n    at FlowParserMixin.parseIfStatement (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12921:42)\n    at FlowParserMixin.parseStatementContent (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12579:21)\n    at FlowParserMixin.parseStatementLike (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12548:17)\n    at FlowParserMixin.parseStatementLike (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:5135:24)\n    at FlowParserMixin.parseStatementListItem (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12528:17)\n    at FlowParserMixin.parseBlockOrModuleBlockBody (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:13120:61)\n    at FlowParserMixin.parseBlockBody (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:13113:10)\n    at FlowParserMixin.parseBlock (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:13101:10)\n    at FlowParserMixin.parseStatementContent (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12635:21)\n    at FlowParserMixin.parseStatementLike (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12548:17)\n    at FlowParserMixin.parseStatementLike (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:5135:24)\n    at FlowParserMixin.parseStatementOrSloppyAnnexBFunctionDeclaration (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12538:17)\n    at FlowParserMixin.parseIfStatement (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12920:28)\n    at FlowParserMixin.parseStatementContent (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12579:21)\n    at FlowParserMixin.parseStatementLike (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12548:17)\n    at FlowParserMixin.parseStatementLike (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:5135:24)\n    at FlowParserMixin.parseStatementListItem (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12528:17)\n    at FlowParserMixin.parseBlockOrModuleBlockBody (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:13120:61)\n    at FlowParserMixin.parseBlockBody (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:13113:10)\n    at FlowParserMixin.parseBlock (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:13101:10)\n    at FlowParserMixin.parseStatementContent (/home/adombrowski/workspace/beautiflow-visualization/.yarn/cache/@babel-parser-npm-7.21.2-43751d3737-e2b89de2c6.zip/node_modules/@babel/parser/lib/index.js:12635:21)");

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("77d29e98e6c2e9e3fafa")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=main.8e02b692a9be7dbff924.hot-update.js.map