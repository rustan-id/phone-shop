console.log('resolve');

Object.assign(global, require('domino').impl);
require('zone.js/dist/zone-node');
const request = require('request');
const { bindNodeCallback, concat } = require('rxjs');
const { map, combineAll, switchMap } = require('rxjs/operators');
const fs = require('fs');
const { renderModuleFactory } = require('@angular/platform-server');
const {
  provideModuleMap
} = require('@nguniversal/module-map-ngfactory-loader');
const path = require('path');
const mkdirp = require('mkdirp');
console.log(path.resolve('./dist/apps/phone-shop-server/main'));

const requestObservable = bindNodeCallback(request);

function normalizePage(page) {
  if (typeof page === 'string') {
    page = {
      route: page
    };
  }
  page.destination = page.destination || `${page.route}/index.html`;
  return page;
}

async function render(page, ngFactory, moduleMap) {
  page = normalizePage(page);

  const result = await renderModuleFactory(ngFactory, {
    document: fs.readFileSync(
      path.join(__dirname, '../dist/apps/phone-shop/index.html')
    ),
    url: page.route,
    extraProviders: [provideModuleMap(moduleMap)]
  });

  const outputPath = path.join(
    __dirname,
    '../../',
    'apps/phone-shop',
    page.destination
  );

  mkdirp.sync(path.join(outputPath, '../'));
  fs.writeFileSync(outputPath, result);
  console.log('Rendered', page.route, 'to', outputPath);
}

type Page =
  | string
  | {
      route: string;
      destination: string;
    };

(async () => {
  console.log(path.resolve('./dist/phone-shop-server/main'));
  const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require(path.resolve(
    './dist/phone-shop-server/main'
  ));
  const pages: Page[] = [
    {
      route: '/',
      destination: 'index.html'
    }
    // '/contact-us',
    // '/services',
    // '/team',
    // '/community',
    // '/nx',
    // '/products',
    // '/careers',
    // '/connect'
  ];

  console.log(
    '🐋 The following pages will be prerendered: \n',
    pages
      .map((page: Page) => (typeof page !== 'string' ? page.route : page))
      .join('\n')
  );
  console.log('\n');

  await Promise.all(
    pages.map(page => render(page, AppServerModuleNgFactory, LAZY_MODULE_MAP))
  );
})();
