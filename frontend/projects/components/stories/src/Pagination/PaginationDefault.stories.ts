import type { StoryObj } from '@storybook/angular';

import type { TarPagination } from 'components';

export const Default: StoryObj<TarPagination> = {
  args: {
    length: 237,
    pageSize: 25,
    pageIndex: 0,
    pageSizeOptions: [10, 25, 50, 100],
    showFirstLastButtons: true,
    hidePageSize: false,
    testId: 'contacts-pagination',
  },
  render: (args) => ({
    props: args,
    template: `<tar-pagination [length]="length" [pageSize]="pageSize" [pageIndex]="pageIndex" [pageSizeOptions]="pageSizeOptions" [showFirstLastButtons]="showFirstLastButtons" [hidePageSize]="hidePageSize" [testId]="testId" />`,
  }),
};
