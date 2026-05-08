// traces_to: L2-082
import { describe, it, expect } from 'vitest';
import { check } from '../lib/contract-token-import.js';

describe('contract-token-import', () => {
  it('passes when component imports the contract token', () => {
    const src = `import { CONTACTS_SERVICE } from './contacts.service.contract';`;
    expect(check('foo.component.ts', src)).toEqual([]);
  });

  it('flags concrete service import in component', () => {
    const src = `import { ContactsService } from './contacts.service';`;
    expect(check('foo.component.ts', src).length).toBeGreaterThan(0);
  });

  it('ignores non-component files', () => {
    const src = `import { ContactsService } from './contacts.service';`;
    expect(check('app.module.ts', src)).toEqual([]);
  });
});
