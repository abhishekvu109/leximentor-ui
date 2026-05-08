const fs = require('fs');

let f = fs.readFileSync('components/layout/NewSidebar.js', 'utf8');

f = f.replace(
    '    UtensilsCrossed\n} from \'lucide-react\';',
    '    UtensilsCrossed,\n    Tags\n} from \'lucide-react\';'
);

f = f.replace(
    '{ label: \'Households\', href: \'/cashflow/households\', icon: Grid },',
    '{ label: \'Households\', href: \'/cashflow/households\', icon: Grid },\n                { label: \'Categories\', href: \'/cashflow/categories\', icon: Tags },'
);

fs.writeFileSync('components/layout/NewSidebar.js', f);
