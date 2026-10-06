import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarCheckbox } from 'components';

export const SelectAll: StoryObj<TarCheckbox> = {
  render: () => {
    const roles = signal([
      { name: 'Greeter', checked: true },
      { name: 'Set-up crew', checked: false },
      { name: 'Kitchen', checked: true },
    ]);
    return {
      props: {
        roles,
        allChecked: () => roles().every((r) => r.checked),
        someChecked: () => roles().some((r) => r.checked) && !roles().every((r) => r.checked),
        setAll: (checked: boolean) => roles.update((rs) => rs.map((r) => ({ ...r, checked }))),
        setOne: (name: string, checked: boolean) =>
          roles.update((rs) => rs.map((r) => (r.name === name ? { ...r, checked } : r))),
      },
      template: `
      <div style="display: grid; gap: 8px">
        <tar-checkbox [checked]="allChecked()" [indeterminate]="someChecked()" (checkedChange)="setAll($event)">All volunteer roles</tar-checkbox>
        <div style="display: grid; gap: 4px; padding-inline-start: 32px">
          @for (role of roles(); track role.name) {
            <tar-checkbox [checked]="role.checked" (checkedChange)="setOne(role.name, $event)">{{ role.name }}</tar-checkbox>
          }
        </div>
      </div>
    `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'A stateful "select all" built from signals: the parent is `indeterminate` when only some children are checked, and checking it sets every child.',
      },
    },
  },
};
