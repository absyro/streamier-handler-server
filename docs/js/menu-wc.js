'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">streamier-handler-server documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                        <li class="link">
                            <a href="todo.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>TODO
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/CommonModule.html" data-type="entity-link" >CommonModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CommonModule-33f83f89cbf81c7366cd96f715bcc5b04446ec03e822004ce17bf4a665fdd1bcf2fb2cd11fcc7d0b6a2a8f39b6bdc3ee4d569965875c7509ed203fc15f05b063"' : 'data-bs-target="#xs-injectables-links-module-CommonModule-33f83f89cbf81c7366cd96f715bcc5b04446ec03e822004ce17bf4a665fdd1bcf2fb2cd11fcc7d0b6a2a8f39b6bdc3ee4d569965875c7509ed203fc15f05b063"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CommonModule-33f83f89cbf81c7366cd96f715bcc5b04446ec03e822004ce17bf4a665fdd1bcf2fb2cd11fcc7d0b6a2a8f39b6bdc3ee4d569965875c7509ed203fc15f05b063"' :
                                        'id="xs-injectables-links-module-CommonModule-33f83f89cbf81c7366cd96f715bcc5b04446ec03e822004ce17bf4a665fdd1bcf2fb2cd11fcc7d0b6a2a8f39b6bdc3ee4d569965875c7509ed203fc15f05b063"' }>
                                        <li class="link">
                                            <a href="injectables/CommonService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CommonService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ConfigModule.html" data-type="entity-link" >ConfigModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/DatabaseModule.html" data-type="entity-link" >DatabaseModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/HandlersModule.html" data-type="entity-link" >HandlersModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-HandlersModule-28b058da55e0ed286028d321e211287f7bb3ffc77c7b9bab5d50bb1d6dcaa34c4f1eb206a20b7afb5b559d4ff8cf74451ae350b44db81cfb97eb7ffd478222ea"' : 'data-bs-target="#xs-controllers-links-module-HandlersModule-28b058da55e0ed286028d321e211287f7bb3ffc77c7b9bab5d50bb1d6dcaa34c4f1eb206a20b7afb5b559d4ff8cf74451ae350b44db81cfb97eb7ffd478222ea"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-HandlersModule-28b058da55e0ed286028d321e211287f7bb3ffc77c7b9bab5d50bb1d6dcaa34c4f1eb206a20b7afb5b559d4ff8cf74451ae350b44db81cfb97eb7ffd478222ea"' :
                                            'id="xs-controllers-links-module-HandlersModule-28b058da55e0ed286028d321e211287f7bb3ffc77c7b9bab5d50bb1d6dcaa34c4f1eb206a20b7afb5b559d4ff8cf74451ae350b44db81cfb97eb7ffd478222ea"' }>
                                            <li class="link">
                                                <a href="controllers/HandlersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HandlersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-HandlersModule-28b058da55e0ed286028d321e211287f7bb3ffc77c7b9bab5d50bb1d6dcaa34c4f1eb206a20b7afb5b559d4ff8cf74451ae350b44db81cfb97eb7ffd478222ea"' : 'data-bs-target="#xs-injectables-links-module-HandlersModule-28b058da55e0ed286028d321e211287f7bb3ffc77c7b9bab5d50bb1d6dcaa34c4f1eb206a20b7afb5b559d4ff8cf74451ae350b44db81cfb97eb7ffd478222ea"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-HandlersModule-28b058da55e0ed286028d321e211287f7bb3ffc77c7b9bab5d50bb1d6dcaa34c4f1eb206a20b7afb5b559d4ff8cf74451ae350b44db81cfb97eb7ffd478222ea"' :
                                        'id="xs-injectables-links-module-HandlersModule-28b058da55e0ed286028d321e211287f7bb3ffc77c7b9bab5d50bb1d6dcaa34c4f1eb206a20b7afb5b559d4ff8cf74451ae350b44db81cfb97eb7ffd478222ea"' }>
                                        <li class="link">
                                            <a href="injectables/HandlersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HandlersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/StreamsModule.html" data-type="entity-link" >StreamsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-StreamsModule-6934a9fd099d691cf11435a6dbcaf8262833500831d9198589114ca264d47fabae5e0ee17a9244b9feac737b464bda22ca87c91e831c32e58943651f2c6a33d1"' : 'data-bs-target="#xs-controllers-links-module-StreamsModule-6934a9fd099d691cf11435a6dbcaf8262833500831d9198589114ca264d47fabae5e0ee17a9244b9feac737b464bda22ca87c91e831c32e58943651f2c6a33d1"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-StreamsModule-6934a9fd099d691cf11435a6dbcaf8262833500831d9198589114ca264d47fabae5e0ee17a9244b9feac737b464bda22ca87c91e831c32e58943651f2c6a33d1"' :
                                            'id="xs-controllers-links-module-StreamsModule-6934a9fd099d691cf11435a6dbcaf8262833500831d9198589114ca264d47fabae5e0ee17a9244b9feac737b464bda22ca87c91e831c32e58943651f2c6a33d1"' }>
                                            <li class="link">
                                                <a href="controllers/StreamsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StreamsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-StreamsModule-6934a9fd099d691cf11435a6dbcaf8262833500831d9198589114ca264d47fabae5e0ee17a9244b9feac737b464bda22ca87c91e831c32e58943651f2c6a33d1"' : 'data-bs-target="#xs-injectables-links-module-StreamsModule-6934a9fd099d691cf11435a6dbcaf8262833500831d9198589114ca264d47fabae5e0ee17a9244b9feac737b464bda22ca87c91e831c32e58943651f2c6a33d1"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-StreamsModule-6934a9fd099d691cf11435a6dbcaf8262833500831d9198589114ca264d47fabae5e0ee17a9244b9feac737b464bda22ca87c91e831c32e58943651f2c6a33d1"' :
                                        'id="xs-injectables-links-module-StreamsModule-6934a9fd099d691cf11435a6dbcaf8262833500831d9198589114ca264d47fabae5e0ee17a9244b9feac737b464bda22ca87c91e831c32e58943651f2c6a33d1"' }>
                                        <li class="link">
                                            <a href="injectables/StreamsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StreamsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#controllers-links"' :
                                'data-bs-target="#xs-controllers-links"' }>
                                <span class="icon ion-md-swap"></span>
                                <span>Controllers</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="controllers-links"' : 'id="xs-controllers-links"' }>
                                <li class="link">
                                    <a href="controllers/HandlersController.html" data-type="entity-link" >HandlersController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/StreamsController.html" data-type="entity-link" >StreamsController</a>
                                </li>
                            </ul>
                        </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#entities-links"' :
                                'data-bs-target="#xs-entities-links"' }>
                                <span class="icon ion-ios-apps"></span>
                                <span>Entities</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="entities-links"' : 'id="xs-entities-links"' }>
                                <li class="link">
                                    <a href="entities/Handler.html" data-type="entity-link" >Handler</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/CreateHandlerDto.html" data-type="entity-link" >CreateHandlerDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/HandlersGateway.html" data-type="entity-link" >HandlersGateway</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateHandlerDto.html" data-type="entity-link" >UpdateHandlerDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/WsAdapter.html" data-type="entity-link" >WsAdapter</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/CommonService.html" data-type="entity-link" >CommonService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HandlersService.html" data-type="entity-link" >HandlersService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StreamsService.html" data-type="entity-link" >StreamsService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Environment.html" data-type="entity-link" >Environment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HandlerSocketData.html" data-type="entity-link" >HandlerSocketData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessEnv.html" data-type="entity-link" >ProcessEnv</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});