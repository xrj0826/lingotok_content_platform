import { DialogPlugin } from 'tdesign-vue-next';

import Edit from '@/pages/coupons-manage/components/Edit.vue';

export function computeEdit(row: any): Promise<number> {
  return new Promise((resolve, reject) => {
    const dialogRef = DialogPlugin({
      body: () => {
        return (
          <Edit
            // @ts-ignore
            onEdit={editFinish}
            editId={row.id}
            onClose={(result: number) => {
              dialogRef.destroy();
              resolve(result);
            }}
          ></Edit>
        );
      },
      confirmBtn: null,
      // @ts-ignore
      cancelBtn: null,
      onClosed: () => {
        dialogRef.destroy();
        reject();
      },
    });
  });
}
