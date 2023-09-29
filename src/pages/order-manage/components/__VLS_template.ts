import { __VLS_internalComponent, __VLS_componentsOption, __VLS_name, handlerEdit, radio, groupChangeFn, visible, loading, edit, close, FORM_RULES, formData, form, onEnter } from './Edit.vue';

function __VLS_template() {
  let __VLS_ctx!: InstanceType<__VLS_PickNotAny<typeof __VLS_internalComponent, new () => {}>> & {};
  /* Components */
  let __VLS_otherComponents!: NonNullable<typeof __VLS_internalComponent extends { components: infer C; } ? C : {}> & typeof __VLS_componentsOption;
  let __VLS_own!: __VLS_SelfComponent<typeof __VLS_name, typeof __VLS_internalComponent & (new () => { $slots: typeof __VLS_slots; })>;
  let __VLS_localComponents!: typeof __VLS_otherComponents & Omit<typeof __VLS_own, keyof typeof __VLS_otherComponents>;
  let __VLS_components!: typeof __VLS_localComponents & __VLS_GlobalComponents & typeof __VLS_ctx;
  /* Style Scoped */
  type __VLS_StyleScopedClasses = {};
  let __VLS_styleScopedClasses!: __VLS_StyleScopedClasses | keyof __VLS_StyleScopedClasses | (keyof __VLS_StyleScopedClasses)[];
  /* CSS variable injection */
  /* CSS variable injection end */
  let __VLS_resolvedLocalAndGlobalComponents!: {} &
    __VLS_WithComponent<'TSpace', typeof __VLS_localComponents, "TSpace", "tSpace", "t-space"> &
    __VLS_WithComponent<'TLink', typeof __VLS_localComponents, "TLink", "tLink", "t-link"> &
    __VLS_WithComponent<'TRadioGroup', typeof __VLS_localComponents, "TRadioGroup", "tRadioGroup", "t-radio-group"> &
    __VLS_WithComponent<'TRadio', typeof __VLS_localComponents, "TRadio", "tRadio", "t-radio"> &
    __VLS_WithComponent<'TDialog', typeof __VLS_localComponents, "TDialog", "tDialog", "t-dialog"> &
    __VLS_WithComponent<'TForm', typeof __VLS_localComponents, "TForm", "tForm", "t-form"> &
    __VLS_WithComponent<'TFormItem', typeof __VLS_localComponents, "TFormItem", "tFormItem", "t-form-item"> &
    __VLS_WithComponent<'TInput', typeof __VLS_localComponents, "TInput", "tInput", "t-input"> &
    __VLS_WithComponent<'TDatePicker', typeof __VLS_localComponents, "TDatePicker", "tDatePicker", "t-date-picker">;
  ({} as __VLS_IntrinsicElements).div; ({} as __VLS_IntrinsicElements).div;
  __VLS_components.TSpace; __VLS_components.TSpace; __VLS_components.tSpace; __VLS_components.tSpace; __VLS_components["t-space"]; __VLS_components["t-space"];
  // @ts-ignore
  [TSpace, TSpace,];
  __VLS_components.TLink; __VLS_components.TLink; __VLS_components.tLink; __VLS_components.tLink; __VLS_components["t-link"]; __VLS_components["t-link"];
  // @ts-ignore
  [TLink, TLink,];
  __VLS_components.TRadioGroup; __VLS_components.TRadioGroup; __VLS_components.TRadioGroup; __VLS_components.TRadioGroup; __VLS_components.TRadioGroup; __VLS_components.TRadioGroup; __VLS_components.tRadioGroup; __VLS_components.tRadioGroup; __VLS_components.tRadioGroup; __VLS_components.tRadioGroup; __VLS_components.tRadioGroup; __VLS_components.tRadioGroup; __VLS_components["t-radio-group"]; __VLS_components["t-radio-group"]; __VLS_components["t-radio-group"]; __VLS_components["t-radio-group"]; __VLS_components["t-radio-group"]; __VLS_components["t-radio-group"];
  // @ts-ignore
  [TRadioGroup, TRadioGroup, TRadioGroup, TRadioGroup, TRadioGroup, TRadioGroup,];
  __VLS_components.TRadio; __VLS_components.TRadio; __VLS_components.TRadio; __VLS_components.TRadio; __VLS_components.TRadio; __VLS_components.TRadio; __VLS_components.TRadio; __VLS_components.TRadio; __VLS_components.TRadio; __VLS_components.TRadio; __VLS_components.TRadio; __VLS_components.TRadio; __VLS_components.tRadio; __VLS_components.tRadio; __VLS_components.tRadio; __VLS_components.tRadio; __VLS_components.tRadio; __VLS_components.tRadio; __VLS_components.tRadio; __VLS_components.tRadio; __VLS_components.tRadio; __VLS_components.tRadio; __VLS_components.tRadio; __VLS_components.tRadio; __VLS_components["t-radio"]; __VLS_components["t-radio"]; __VLS_components["t-radio"]; __VLS_components["t-radio"]; __VLS_components["t-radio"]; __VLS_components["t-radio"]; __VLS_components["t-radio"]; __VLS_components["t-radio"]; __VLS_components["t-radio"]; __VLS_components["t-radio"]; __VLS_components["t-radio"]; __VLS_components["t-radio"];
  // @ts-ignore
  [TRadio, TRadio, TRadio, TRadio, TRadio, TRadio, TRadio, TRadio, TRadio, TRadio, TRadio, TRadio,];
  __VLS_components.TDialog; __VLS_components.TDialog; __VLS_components.tDialog; __VLS_components.tDialog; __VLS_components["t-dialog"]; __VLS_components["t-dialog"];
  // @ts-ignore
  [TDialog, TDialog,];
  __VLS_components.TForm; __VLS_components.TForm; __VLS_components.tForm; __VLS_components.tForm; __VLS_components["t-form"]; __VLS_components["t-form"];
  // @ts-ignore
  [TForm, TForm,];
  __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.TFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components.tFormItem; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"]; __VLS_components["t-form-item"];
  // @ts-ignore
  [TFormItem, TFormItem, TFormItem, TFormItem, TFormItem, TFormItem, TFormItem, TFormItem, TFormItem, TFormItem, TFormItem, TFormItem, TFormItem, TFormItem, TFormItem, TFormItem, TFormItem, TFormItem, TFormItem, TFormItem, TFormItem, TFormItem, TFormItem, TFormItem, TFormItem, TFormItem,];
  __VLS_components.TInput; __VLS_components.TInput; __VLS_components.TInput; __VLS_components.TInput; __VLS_components.TInput; __VLS_components.TInput; __VLS_components.TInput; __VLS_components.TInput; __VLS_components.TInput; __VLS_components.TInput; __VLS_components.TInput; __VLS_components.TInput; __VLS_components.tInput; __VLS_components.tInput; __VLS_components.tInput; __VLS_components.tInput; __VLS_components.tInput; __VLS_components.tInput; __VLS_components.tInput; __VLS_components.tInput; __VLS_components.tInput; __VLS_components.tInput; __VLS_components.tInput; __VLS_components.tInput; __VLS_components["t-input"]; __VLS_components["t-input"]; __VLS_components["t-input"]; __VLS_components["t-input"]; __VLS_components["t-input"]; __VLS_components["t-input"]; __VLS_components["t-input"]; __VLS_components["t-input"]; __VLS_components["t-input"]; __VLS_components["t-input"]; __VLS_components["t-input"]; __VLS_components["t-input"];
  // @ts-ignore
  [TInput, TInput, TInput, TInput, TInput, TInput, TInput, TInput, TInput, TInput, TInput, TInput,];
  __VLS_components.TDatePicker; __VLS_components.TDatePicker; __VLS_components.TDatePicker; __VLS_components.TDatePicker; __VLS_components.TDatePicker; __VLS_components.tDatePicker; __VLS_components.tDatePicker; __VLS_components.tDatePicker; __VLS_components.tDatePicker; __VLS_components.tDatePicker; __VLS_components["t-date-picker"]; __VLS_components["t-date-picker"]; __VLS_components["t-date-picker"]; __VLS_components["t-date-picker"]; __VLS_components["t-date-picker"];
  // @ts-ignore
  [TDatePicker, TDatePicker, TDatePicker, TDatePicker, TDatePicker,];
  ({} as __VLS_IntrinsicElements).span; ({} as __VLS_IntrinsicElements).span;
  {
    const __VLS_0 = ({} as __VLS_IntrinsicElements)["div"];
    const __VLS_1 = __VLS_elementAsFunctionalComponent(__VLS_0);
    ({} as __VLS_IntrinsicElements).div;
    ({} as __VLS_IntrinsicElements).div;
    const __VLS_2 = __VLS_1({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_0, typeof __VLS_2> & Record<string, unknown>) => void)({ ...{}, });
    const __VLS_3 = __VLS_pickFunctionalComponentCtx(__VLS_0, __VLS_2)!;
    let __VLS_4!: __VLS_NormalizeEmits<typeof __VLS_3.emit>;
    {
      let __VLS_5!: 'TSpace' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TSpace : 'tSpace' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tSpace : 't-space' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-space'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TSpace'];
      const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({ ...{}, }));
      ({} as { TSpace: typeof __VLS_5; }).TSpace;
      ({} as { TSpace: typeof __VLS_5; }).TSpace;
      const __VLS_7 = __VLS_6({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_6));
      ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_5, typeof __VLS_7> & Record<string, unknown>) => void)({ ...{}, });
      const __VLS_8 = __VLS_pickFunctionalComponentCtx(__VLS_5, __VLS_7)!;
      let __VLS_9!: __VLS_NormalizeEmits<typeof __VLS_8.emit>;
      {
        let __VLS_10!: 'TLink' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TLink : 'tLink' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tLink : 't-link' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-link'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TLink'];
        const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({ ...{ onClick: {} as any, }, theme: ("primary"), }));
        ({} as { TLink: typeof __VLS_10; }).TLink;
        ({} as { TLink: typeof __VLS_10; }).TLink;
        const __VLS_12 = __VLS_11({ ...{ onClick: {} as any, }, theme: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_11));
        ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_10, typeof __VLS_12> & Record<string, unknown>) => void)({ ...{ onClick: {} as any, }, theme: ("primary"), });
        const __VLS_13 = __VLS_pickFunctionalComponentCtx(__VLS_10, __VLS_12)!;
        let __VLS_14!: __VLS_NormalizeEmits<typeof __VLS_13.emit>;
        let __VLS_15 = { 'click': __VLS_pickEvent(__VLS_14['click'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_11, typeof __VLS_12>).onClick) };
        __VLS_15 = {
          click: (__VLS_ctx.handlerEdit)
        };
        (__VLS_13.slots!).default;
      }
      (__VLS_8.slots!).default;
    }
    {
      let __VLS_16!: 'TRadioGroup' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TRadioGroup : 'tRadioGroup' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tRadioGroup : 't-radio-group' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-radio-group'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TRadioGroup'];
      const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({ ...{ onChange: {} as any, }, defaultValue: ((__VLS_ctx.radio)), class: ("radio-group-demo"), }));
      ({} as { TRadioGroup: typeof __VLS_16; }).TRadioGroup;
      ({} as { TRadioGroup: typeof __VLS_16; }).TRadioGroup;
      const __VLS_18 = __VLS_17({ ...{ onChange: {} as any, }, defaultValue: ((__VLS_ctx.radio)), class: ("radio-group-demo"), }, ...__VLS_functionalComponentArgsRest(__VLS_17));
      ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_16, typeof __VLS_18> & Record<string, unknown>) => void)({ ...{ onChange: {} as any, }, defaultValue: ((__VLS_ctx.radio)), class: ("radio-group-demo"), });
      const __VLS_19 = __VLS_pickFunctionalComponentCtx(__VLS_16, __VLS_18)!;
      let __VLS_20!: __VLS_NormalizeEmits<typeof __VLS_19.emit>;
      let __VLS_21 = { 'change': __VLS_pickEvent(__VLS_20['change'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_17, typeof __VLS_18>).onChange) };
      __VLS_21 = {
        change: (__VLS_ctx.groupChangeFn)
      };
      {
        let __VLS_22!: 'TRadio' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TRadio : 'tRadio' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tRadio : 't-radio' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-radio'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TRadio'];
        const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({ ...{}, name: ("radio"), value: ("1"), label: ("单选"), }));
        ({} as { TRadio: typeof __VLS_22; }).TRadio;
        const __VLS_24 = __VLS_23({ ...{}, name: ("radio"), value: ("1"), label: ("单选"), }, ...__VLS_functionalComponentArgsRest(__VLS_23));
        ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_22, typeof __VLS_24> & Record<string, unknown>) => void)({ ...{}, name: ("radio"), value: ("1"), label: ("单选"), });
        const __VLS_25 = __VLS_pickFunctionalComponentCtx(__VLS_22, __VLS_24)!;
        let __VLS_26!: __VLS_NormalizeEmits<typeof __VLS_25.emit>;
      }
      {
        let __VLS_27!: 'TRadio' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TRadio : 'tRadio' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tRadio : 't-radio' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-radio'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TRadio'];
        const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({ ...{}, name: ("radio"), value: ("2"), label: ("单选"), }));
        ({} as { TRadio: typeof __VLS_27; }).TRadio;
        const __VLS_29 = __VLS_28({ ...{}, name: ("radio"), value: ("2"), label: ("单选"), }, ...__VLS_functionalComponentArgsRest(__VLS_28));
        ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_27, typeof __VLS_29> & Record<string, unknown>) => void)({ ...{}, name: ("radio"), value: ("2"), label: ("单选"), });
        const __VLS_30 = __VLS_pickFunctionalComponentCtx(__VLS_27, __VLS_29)!;
        let __VLS_31!: __VLS_NormalizeEmits<typeof __VLS_30.emit>;
      }
      {
        let __VLS_32!: 'TRadio' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TRadio : 'tRadio' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tRadio : 't-radio' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-radio'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TRadio'];
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ ...{}, name: ("radio"), value: ("3"), label: ("单选单选单选单选单选单选单选单选单选单选单选单选单选单选单选单选单选单选"), }));
        ({} as { TRadio: typeof __VLS_32; }).TRadio;
        const __VLS_34 = __VLS_33({ ...{}, name: ("radio"), value: ("3"), label: ("单选单选单选单选单选单选单选单选单选单选单选单选单选单选单选单选单选单选"), }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_32, typeof __VLS_34> & Record<string, unknown>) => void)({ ...{}, name: ("radio"), value: ("3"), label: ("单选单选单选单选单选单选单选单选单选单选单选单选单选单选单选单选单选单选"), });
        const __VLS_35 = __VLS_pickFunctionalComponentCtx(__VLS_32, __VLS_34)!;
        let __VLS_36!: __VLS_NormalizeEmits<typeof __VLS_35.emit>;
      }
      {
        let __VLS_37!: 'TRadio' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TRadio : 'tRadio' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tRadio : 't-radio' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-radio'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TRadio'];
        const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({ ...{}, name: ("radio"), value: ("4"), label: ("单选"), content: ("描述信息描述信息描述信息描述信息描述信息描述信息描述信息描述信息描述信息描述信息"), }));
        ({} as { TRadio: typeof __VLS_37; }).TRadio;
        const __VLS_39 = __VLS_38({ ...{}, name: ("radio"), value: ("4"), label: ("单选"), content: ("描述信息描述信息描述信息描述信息描述信息描述信息描述信息描述信息描述信息描述信息"), }, ...__VLS_functionalComponentArgsRest(__VLS_38));
        ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_37, typeof __VLS_39> & Record<string, unknown>) => void)({ ...{}, name: ("radio"), value: ("4"), label: ("单选"), content: ("描述信息描述信息描述信息描述信息描述信息描述信息描述信息描述信息描述信息描述信息"), });
        const __VLS_40 = __VLS_pickFunctionalComponentCtx(__VLS_37, __VLS_39)!;
        let __VLS_41!: __VLS_NormalizeEmits<typeof __VLS_40.emit>;
      }
      (__VLS_19.slots!).default;
    }
    {
      let __VLS_42!: 'TDialog' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TDialog : 'tDialog' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tDialog : 't-dialog' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-dialog'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TDialog'];
      const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
        ...{}, visible: ((__VLS_ctx.visible)), header: ("修改场地信息"), body: ("保存中，请稍后"), confirmBtn: (({
          content: '提交',
          theme: 'primary',
          loading: __VLS_ctx.loading,
        })), onConfirm: ((__VLS_ctx.edit)), onClose: ((__VLS_ctx.close)),
      }));
      ({} as { TDialog: typeof __VLS_42; }).TDialog;
      ({} as { TDialog: typeof __VLS_42; }).TDialog;
      const __VLS_44 = __VLS_43({
        ...{}, visible: ((__VLS_ctx.visible)), header: ("修改场地信息"), body: ("保存中，请稍后"), confirmBtn: (({
          content: '提交',
          theme: 'primary',
          loading: __VLS_ctx.loading,
        })), onConfirm: ((__VLS_ctx.edit)), onClose: ((__VLS_ctx.close)),
      }, ...__VLS_functionalComponentArgsRest(__VLS_43));
      ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_42, typeof __VLS_44> & Record<string, unknown>) => void)({
        ...{}, visible: ((__VLS_ctx.visible)), header: ("修改场地信息"), body: ("保存中，请稍后"), confirmBtn: (({
          content: '提交',
          theme: 'primary',
          loading: __VLS_ctx.loading,
        })), onConfirm: ((__VLS_ctx.edit)), onClose: ((__VLS_ctx.close)),
      });
      const __VLS_45 = __VLS_pickFunctionalComponentCtx(__VLS_42, __VLS_44)!;
      let __VLS_46!: __VLS_NormalizeEmits<typeof __VLS_45.emit>;
      {
        let __VLS_47!: 'TForm' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TForm : 'tForm' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tForm : 't-form' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-form'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TForm'];
        const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({ ...{}, ref: ("form"), rules: ((__VLS_ctx.FORM_RULES)), data: ((__VLS_ctx.formData)), colon: ((true)), }));
        ({} as { TForm: typeof __VLS_47; }).TForm;
        ({} as { TForm: typeof __VLS_47; }).TForm;
        const __VLS_49 = __VLS_48({ ...{}, ref: ("form"), rules: ((__VLS_ctx.FORM_RULES)), data: ((__VLS_ctx.formData)), colon: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_48));
        ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_47, typeof __VLS_49> & Record<string, unknown>) => void)({ ...{}, ref: ("form"), rules: ((__VLS_ctx.FORM_RULES)), data: ((__VLS_ctx.formData)), colon: ((true)), });
        const __VLS_50 = __VLS_pickFunctionalComponentCtx(__VLS_47, __VLS_49)!;
        let __VLS_51!: __VLS_NormalizeEmits<typeof __VLS_50.emit>;
        // @ts-ignore
        (__VLS_ctx.form);
        {
          let __VLS_52!: 'TFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TFormItem : 'tFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tFormItem : 't-form-item' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-form-item'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TFormItem'];
          const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({ ...{}, label: ("订单价格"), name: ("orderPrice"), }));
          ({} as { TFormItem: typeof __VLS_52; }).TFormItem;
          ({} as { TFormItem: typeof __VLS_52; }).TFormItem;
          const __VLS_54 = __VLS_53({ ...{}, label: ("订单价格"), name: ("orderPrice"), }, ...__VLS_functionalComponentArgsRest(__VLS_53));
          ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_52, typeof __VLS_54> & Record<string, unknown>) => void)({ ...{}, label: ("订单价格"), name: ("orderPrice"), });
          const __VLS_55 = __VLS_pickFunctionalComponentCtx(__VLS_52, __VLS_54)!;
          let __VLS_56!: __VLS_NormalizeEmits<typeof __VLS_55.emit>;
          {
            let __VLS_57!: 'TInput' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TInput : 'tInput' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tInput : 't-input' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-input'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TInput'];
            const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({ ...{ onEnter: {} as any, }, modelValue: ((__VLS_ctx.formData.orderPrice)), placeholder: ("请输入内容"), }));
            ({} as { TInput: typeof __VLS_57; }).TInput;
            ({} as { TInput: typeof __VLS_57; }).TInput;
            const __VLS_59 = __VLS_58({ ...{ onEnter: {} as any, }, modelValue: ((__VLS_ctx.formData.orderPrice)), placeholder: ("请输入内容"), }, ...__VLS_functionalComponentArgsRest(__VLS_58));
            ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_57, typeof __VLS_59> & Record<string, unknown>) => void)({ ...{ onEnter: {} as any, }, modelValue: ((__VLS_ctx.formData.orderPrice)), placeholder: ("请输入内容"), });
            const __VLS_60 = __VLS_pickFunctionalComponentCtx(__VLS_57, __VLS_59)!;
            let __VLS_61!: __VLS_NormalizeEmits<typeof __VLS_60.emit>;
            let __VLS_62 = { 'enter': __VLS_pickEvent(__VLS_61['enter'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_58, typeof __VLS_59>).onEnter) };
            __VLS_62 = {
              enter: (__VLS_ctx.onEnter)
            };
          }
          (__VLS_55.slots!).default;
        }
        {
          let __VLS_63!: 'TFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TFormItem : 'tFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tFormItem : 't-form-item' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-form-item'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TFormItem'];
          const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({ ...{}, label: ("预约开始时间"), name: ("orderSt"), }));
          ({} as { TFormItem: typeof __VLS_63; }).TFormItem;
          ({} as { TFormItem: typeof __VLS_63; }).TFormItem;
          const __VLS_65 = __VLS_64({ ...{}, label: ("预约开始时间"), name: ("orderSt"), }, ...__VLS_functionalComponentArgsRest(__VLS_64));
          ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_63, typeof __VLS_65> & Record<string, unknown>) => void)({ ...{}, label: ("预约开始时间"), name: ("orderSt"), });
          const __VLS_66 = __VLS_pickFunctionalComponentCtx(__VLS_63, __VLS_65)!;
          let __VLS_67!: __VLS_NormalizeEmits<typeof __VLS_66.emit>;
          {
            let __VLS_68!: 'TDatePicker' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TDatePicker : 'tDatePicker' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tDatePicker : 't-date-picker' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-date-picker'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TDatePicker'];
            const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({ ...{}, modelValue: ((__VLS_ctx.formData.orderDate)), enableTimePicker: (true), allowInput: (true), clearable: (true), }));
            ({} as { TDatePicker: typeof __VLS_68; }).TDatePicker;
            const __VLS_70 = __VLS_69({ ...{}, modelValue: ((__VLS_ctx.formData.orderDate)), enableTimePicker: (true), allowInput: (true), clearable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_69));
            ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_68, typeof __VLS_70> & Record<string, unknown>) => void)({ ...{}, modelValue: ((__VLS_ctx.formData.orderDate)), enableTimePicker: (true), allowInput: (true), clearable: (true), });
            const __VLS_71 = __VLS_pickFunctionalComponentCtx(__VLS_68, __VLS_70)!;
            let __VLS_72!: __VLS_NormalizeEmits<typeof __VLS_71.emit>;
          }
          (__VLS_66.slots!).default;
        }
        {
          let __VLS_73!: 'TFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TFormItem : 'tFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tFormItem : 't-form-item' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-form-item'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TFormItem'];
          const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({ ...{}, label: ("预约结束时间"), name: ("orderEd"), }));
          ({} as { TFormItem: typeof __VLS_73; }).TFormItem;
          ({} as { TFormItem: typeof __VLS_73; }).TFormItem;
          const __VLS_75 = __VLS_74({ ...{}, label: ("预约结束时间"), name: ("orderEd"), }, ...__VLS_functionalComponentArgsRest(__VLS_74));
          ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_73, typeof __VLS_75> & Record<string, unknown>) => void)({ ...{}, label: ("预约结束时间"), name: ("orderEd"), });
          const __VLS_76 = __VLS_pickFunctionalComponentCtx(__VLS_73, __VLS_75)!;
          let __VLS_77!: __VLS_NormalizeEmits<typeof __VLS_76.emit>;
          {
            let __VLS_78!: 'TDatePicker' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TDatePicker : 'tDatePicker' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tDatePicker : 't-date-picker' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-date-picker'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TDatePicker'];
            const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({ ...{}, modelValue: ((__VLS_ctx.formData.orderDate)), enableTimePicker: (true), allowInput: (true), clearable: (true), }));
            ({} as { TDatePicker: typeof __VLS_78; }).TDatePicker;
            const __VLS_80 = __VLS_79({ ...{}, modelValue: ((__VLS_ctx.formData.orderDate)), enableTimePicker: (true), allowInput: (true), clearable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_79));
            ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_78, typeof __VLS_80> & Record<string, unknown>) => void)({ ...{}, modelValue: ((__VLS_ctx.formData.orderDate)), enableTimePicker: (true), allowInput: (true), clearable: (true), });
            const __VLS_81 = __VLS_pickFunctionalComponentCtx(__VLS_78, __VLS_80)!;
            let __VLS_82!: __VLS_NormalizeEmits<typeof __VLS_81.emit>;
          }
          (__VLS_76.slots!).default;
        }
        {
          let __VLS_83!: 'TFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TFormItem : 'tFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tFormItem : 't-form-item' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-form-item'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TFormItem'];
          const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({ ...{}, label: ("删除标志"), name: ("deleteFlag"), }));
          ({} as { TFormItem: typeof __VLS_83; }).TFormItem;
          ({} as { TFormItem: typeof __VLS_83; }).TFormItem;
          const __VLS_85 = __VLS_84({ ...{}, label: ("删除标志"), name: ("deleteFlag"), }, ...__VLS_functionalComponentArgsRest(__VLS_84));
          ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_83, typeof __VLS_85> & Record<string, unknown>) => void)({ ...{}, label: ("删除标志"), name: ("deleteFlag"), });
          const __VLS_86 = __VLS_pickFunctionalComponentCtx(__VLS_83, __VLS_85)!;
          let __VLS_87!: __VLS_NormalizeEmits<typeof __VLS_86.emit>;
          {
            let __VLS_88!: 'TRadioGroup' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TRadioGroup : 'tRadioGroup' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tRadioGroup : 't-radio-group' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-radio-group'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TRadioGroup'];
            const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({ ...{}, modelValue: ((__VLS_ctx.formData.deleteFlag)), defaultValue: ((__VLS_ctx.formData.deleteFlag)), }));
            ({} as { TRadioGroup: typeof __VLS_88; }).TRadioGroup;
            ({} as { TRadioGroup: typeof __VLS_88; }).TRadioGroup;
            const __VLS_90 = __VLS_89({ ...{}, modelValue: ((__VLS_ctx.formData.deleteFlag)), defaultValue: ((__VLS_ctx.formData.deleteFlag)), }, ...__VLS_functionalComponentArgsRest(__VLS_89));
            ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_88, typeof __VLS_90> & Record<string, unknown>) => void)({ ...{}, modelValue: ((__VLS_ctx.formData.deleteFlag)), defaultValue: ((__VLS_ctx.formData.deleteFlag)), });
            const __VLS_91 = __VLS_pickFunctionalComponentCtx(__VLS_88, __VLS_90)!;
            let __VLS_92!: __VLS_NormalizeEmits<typeof __VLS_91.emit>;
            {
              let __VLS_93!: 'TRadio' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TRadio : 'tRadio' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tRadio : 't-radio' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-radio'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TRadio'];
              const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({ ...{}, value: ((true)), }));
              ({} as { TRadio: typeof __VLS_93; }).TRadio;
              ({} as { TRadio: typeof __VLS_93; }).TRadio;
              const __VLS_95 = __VLS_94({ ...{}, value: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_94));
              ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_93, typeof __VLS_95> & Record<string, unknown>) => void)({ ...{}, value: ((true)), });
              const __VLS_96 = __VLS_pickFunctionalComponentCtx(__VLS_93, __VLS_95)!;
              let __VLS_97!: __VLS_NormalizeEmits<typeof __VLS_96.emit>;
              (__VLS_96.slots!).default;
            }
            {
              let __VLS_98!: 'TRadio' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TRadio : 'tRadio' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tRadio : 't-radio' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-radio'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TRadio'];
              const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({ ...{}, value: ((false)), }));
              ({} as { TRadio: typeof __VLS_98; }).TRadio;
              ({} as { TRadio: typeof __VLS_98; }).TRadio;
              const __VLS_100 = __VLS_99({ ...{}, value: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_99));
              ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_98, typeof __VLS_100> & Record<string, unknown>) => void)({ ...{}, value: ((false)), });
              const __VLS_101 = __VLS_pickFunctionalComponentCtx(__VLS_98, __VLS_100)!;
              let __VLS_102!: __VLS_NormalizeEmits<typeof __VLS_101.emit>;
              (__VLS_101.slots!).default;
            }
            (__VLS_91.slots!).default;
          }
          (__VLS_86.slots!).default;
        }
        {
          let __VLS_103!: 'TFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TFormItem : 'tFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tFormItem : 't-form-item' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-form-item'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TFormItem'];
          const __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103({ ...{}, label: ("订单状态"), name: ("orderState"), }));
          ({} as { TFormItem: typeof __VLS_103; }).TFormItem;
          ({} as { TFormItem: typeof __VLS_103; }).TFormItem;
          const __VLS_105 = __VLS_104({ ...{}, label: ("订单状态"), name: ("orderState"), }, ...__VLS_functionalComponentArgsRest(__VLS_104));
          ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_103, typeof __VLS_105> & Record<string, unknown>) => void)({ ...{}, label: ("订单状态"), name: ("orderState"), });
          const __VLS_106 = __VLS_pickFunctionalComponentCtx(__VLS_103, __VLS_105)!;
          let __VLS_107!: __VLS_NormalizeEmits<typeof __VLS_106.emit>;
          {
            let __VLS_108!: 'TRadioGroup' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TRadioGroup : 'tRadioGroup' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tRadioGroup : 't-radio-group' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-radio-group'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TRadioGroup'];
            const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({ ...{}, modelValue: ((__VLS_ctx.formData.deleteFlag)), defaultValue: ((__VLS_ctx.formData.deleteFlag)), }));
            ({} as { TRadioGroup: typeof __VLS_108; }).TRadioGroup;
            ({} as { TRadioGroup: typeof __VLS_108; }).TRadioGroup;
            const __VLS_110 = __VLS_109({ ...{}, modelValue: ((__VLS_ctx.formData.deleteFlag)), defaultValue: ((__VLS_ctx.formData.deleteFlag)), }, ...__VLS_functionalComponentArgsRest(__VLS_109));
            ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_108, typeof __VLS_110> & Record<string, unknown>) => void)({ ...{}, modelValue: ((__VLS_ctx.formData.deleteFlag)), defaultValue: ((__VLS_ctx.formData.deleteFlag)), });
            const __VLS_111 = __VLS_pickFunctionalComponentCtx(__VLS_108, __VLS_110)!;
            let __VLS_112!: __VLS_NormalizeEmits<typeof __VLS_111.emit>;
            {
              let __VLS_113!: 'TRadio' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TRadio : 'tRadio' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tRadio : 't-radio' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-radio'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TRadio'];
              const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({ ...{}, value: ((true)), }));
              ({} as { TRadio: typeof __VLS_113; }).TRadio;
              ({} as { TRadio: typeof __VLS_113; }).TRadio;
              const __VLS_115 = __VLS_114({ ...{}, value: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_114));
              ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_113, typeof __VLS_115> & Record<string, unknown>) => void)({ ...{}, value: ((true)), });
              const __VLS_116 = __VLS_pickFunctionalComponentCtx(__VLS_113, __VLS_115)!;
              let __VLS_117!: __VLS_NormalizeEmits<typeof __VLS_116.emit>;
              (__VLS_116.slots!).default;
            }
            {
              let __VLS_118!: 'TRadio' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TRadio : 'tRadio' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tRadio : 't-radio' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-radio'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TRadio'];
              const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({ ...{}, value: ((false)), }));
              ({} as { TRadio: typeof __VLS_118; }).TRadio;
              ({} as { TRadio: typeof __VLS_118; }).TRadio;
              const __VLS_120 = __VLS_119({ ...{}, value: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_119));
              ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_118, typeof __VLS_120> & Record<string, unknown>) => void)({ ...{}, value: ((false)), });
              const __VLS_121 = __VLS_pickFunctionalComponentCtx(__VLS_118, __VLS_120)!;
              let __VLS_122!: __VLS_NormalizeEmits<typeof __VLS_121.emit>;
              (__VLS_121.slots!).default;
            }
            (__VLS_111.slots!).default;
          }
          (__VLS_106.slots!).default;
        }
        {
          let __VLS_123!: 'TFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TFormItem : 'tFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tFormItem : 't-form-item' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-form-item'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TFormItem'];
          const __VLS_124 = __VLS_asFunctionalComponent(__VLS_123, new __VLS_123({ ...{}, label: ("订单价格"), name: ("orderPrice"), }));
          ({} as { TFormItem: typeof __VLS_123; }).TFormItem;
          ({} as { TFormItem: typeof __VLS_123; }).TFormItem;
          const __VLS_125 = __VLS_124({ ...{}, label: ("订单价格"), name: ("orderPrice"), }, ...__VLS_functionalComponentArgsRest(__VLS_124));
          ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_123, typeof __VLS_125> & Record<string, unknown>) => void)({ ...{}, label: ("订单价格"), name: ("orderPrice"), });
          const __VLS_126 = __VLS_pickFunctionalComponentCtx(__VLS_123, __VLS_125)!;
          let __VLS_127!: __VLS_NormalizeEmits<typeof __VLS_126.emit>;
          {
            const __VLS_128 = ({} as __VLS_IntrinsicElements)["span"];
            const __VLS_129 = __VLS_elementAsFunctionalComponent(__VLS_128);
            ({} as __VLS_IntrinsicElements).span;
            ({} as __VLS_IntrinsicElements).span;
            const __VLS_130 = __VLS_129({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_129));
            ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_128, typeof __VLS_130> & Record<string, unknown>) => void)({ ...{}, });
            const __VLS_131 = __VLS_pickFunctionalComponentCtx(__VLS_128, __VLS_130)!;
            let __VLS_132!: __VLS_NormalizeEmits<typeof __VLS_131.emit>;
            (
              __VLS_ctx.scope.row.orderState == 1
                ? '待使用'
                : __VLS_ctx.scope.row.orderState == 2
                  ? '使用中'
                  : __VLS_ctx.scope.row.orderState == 3
                    ? '已使用'
                    : __VLS_ctx.scope.row.orderState == 4
                      ? '已失效'
                      : __VLS_ctx.scope.row.orderState == 5
                        ? '待评价'
                        : __VLS_ctx.scope.row.orderState == 6
                          ? '退款' : ); __VLS_ctx.
                        ;
            ;
            (__VLS_131.slots!).default;
          }
          {
            let __VLS_133!: 'TInput' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TInput : 'tInput' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tInput : 't-input' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-input'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TInput'];
            const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({ ...{ onEnter: {} as any, }, modelValue: ((__VLS_ctx.formData.orderPrice)), placeholder: ("请输入内容"), }));
            ({} as { TInput: typeof __VLS_133; }).TInput;
            ({} as { TInput: typeof __VLS_133; }).TInput;
            const __VLS_135 = __VLS_134({ ...{ onEnter: {} as any, }, modelValue: ((__VLS_ctx.formData.orderPrice)), placeholder: ("请输入内容"), }, ...__VLS_functionalComponentArgsRest(__VLS_134));
            ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_133, typeof __VLS_135> & Record<string, unknown>) => void)({ ...{ onEnter: {} as any, }, modelValue: ((__VLS_ctx.formData.orderPrice)), placeholder: ("请输入内容"), });
            const __VLS_136 = __VLS_pickFunctionalComponentCtx(__VLS_133, __VLS_135)!;
            let __VLS_137!: __VLS_NormalizeEmits<typeof __VLS_136.emit>;
            let __VLS_138 = { 'enter': __VLS_pickEvent(__VLS_137['enter'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_134, typeof __VLS_135>).onEnter) };
            __VLS_138 = {
              enter: (__VLS_ctx.onEnter)
            };
          }
          (__VLS_126.slots!).default;
        }
        {
          let __VLS_139!: 'TFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TFormItem : 'tFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tFormItem : 't-form-item' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-form-item'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TFormItem'];
          const __VLS_140 = __VLS_asFunctionalComponent(__VLS_139, new __VLS_139({ ...{}, label: ("订单类型（枚举）"), name: ("orderType"), }));
          ({} as { TFormItem: typeof __VLS_139; }).TFormItem;
          ({} as { TFormItem: typeof __VLS_139; }).TFormItem;
          const __VLS_141 = __VLS_140({ ...{}, label: ("订单类型（枚举）"), name: ("orderType"), }, ...__VLS_functionalComponentArgsRest(__VLS_140));
          ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_139, typeof __VLS_141> & Record<string, unknown>) => void)({ ...{}, label: ("订单类型（枚举）"), name: ("orderType"), });
          const __VLS_142 = __VLS_pickFunctionalComponentCtx(__VLS_139, __VLS_141)!;
          let __VLS_143!: __VLS_NormalizeEmits<typeof __VLS_142.emit>;
          {
            let __VLS_144!: 'TInput' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TInput : 'tInput' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tInput : 't-input' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-input'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TInput'];
            const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({ ...{ onEnter: {} as any, }, modelValue: ((__VLS_ctx.formData.orderType)), placeholder: ("请输入内容"), }));
            ({} as { TInput: typeof __VLS_144; }).TInput;
            ({} as { TInput: typeof __VLS_144; }).TInput;
            const __VLS_146 = __VLS_145({ ...{ onEnter: {} as any, }, modelValue: ((__VLS_ctx.formData.orderType)), placeholder: ("请输入内容"), }, ...__VLS_functionalComponentArgsRest(__VLS_145));
            ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_144, typeof __VLS_146> & Record<string, unknown>) => void)({ ...{ onEnter: {} as any, }, modelValue: ((__VLS_ctx.formData.orderType)), placeholder: ("请输入内容"), });
            const __VLS_147 = __VLS_pickFunctionalComponentCtx(__VLS_144, __VLS_146)!;
            let __VLS_148!: __VLS_NormalizeEmits<typeof __VLS_147.emit>;
            let __VLS_149 = { 'enter': __VLS_pickEvent(__VLS_148['enter'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_145, typeof __VLS_146>).onEnter) };
            __VLS_149 = {
              enter: (__VLS_ctx.onEnter)
            };
          }
          (__VLS_142.slots!).default;
        }
        {
          let __VLS_150!: 'TFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TFormItem : 'tFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tFormItem : 't-form-item' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-form-item'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TFormItem'];
          const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({ ...{}, label: ("支付方式"), name: ("paymentMethods"), }));
          ({} as { TFormItem: typeof __VLS_150; }).TFormItem;
          ({} as { TFormItem: typeof __VLS_150; }).TFormItem;
          const __VLS_152 = __VLS_151({ ...{}, label: ("支付方式"), name: ("paymentMethods"), }, ...__VLS_functionalComponentArgsRest(__VLS_151));
          ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_150, typeof __VLS_152> & Record<string, unknown>) => void)({ ...{}, label: ("支付方式"), name: ("paymentMethods"), });
          const __VLS_153 = __VLS_pickFunctionalComponentCtx(__VLS_150, __VLS_152)!;
          let __VLS_154!: __VLS_NormalizeEmits<typeof __VLS_153.emit>;
          {
            let __VLS_155!: 'TInput' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TInput : 'tInput' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tInput : 't-input' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-input'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TInput'];
            const __VLS_156 = __VLS_asFunctionalComponent(__VLS_155, new __VLS_155({ ...{ onEnter: {} as any, }, modelValue: ((__VLS_ctx.formData.paymentMethods)), placeholder: ("请输入内容"), }));
            ({} as { TInput: typeof __VLS_155; }).TInput;
            ({} as { TInput: typeof __VLS_155; }).TInput;
            const __VLS_157 = __VLS_156({ ...{ onEnter: {} as any, }, modelValue: ((__VLS_ctx.formData.paymentMethods)), placeholder: ("请输入内容"), }, ...__VLS_functionalComponentArgsRest(__VLS_156));
            ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_155, typeof __VLS_157> & Record<string, unknown>) => void)({ ...{ onEnter: {} as any, }, modelValue: ((__VLS_ctx.formData.paymentMethods)), placeholder: ("请输入内容"), });
            const __VLS_158 = __VLS_pickFunctionalComponentCtx(__VLS_155, __VLS_157)!;
            let __VLS_159!: __VLS_NormalizeEmits<typeof __VLS_158.emit>;
            let __VLS_160 = { 'enter': __VLS_pickEvent(__VLS_159['enter'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_156, typeof __VLS_157>).onEnter) };
            __VLS_160 = {
              enter: (__VLS_ctx.onEnter)
            };
          }
          (__VLS_153.slots!).default;
        }
        {
          let __VLS_161!: 'TFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TFormItem : 'tFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tFormItem : 't-form-item' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-form-item'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TFormItem'];
          const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({ ...{}, label: ("分享次数"), name: ("share"), }));
          ({} as { TFormItem: typeof __VLS_161; }).TFormItem;
          ({} as { TFormItem: typeof __VLS_161; }).TFormItem;
          const __VLS_163 = __VLS_162({ ...{}, label: ("分享次数"), name: ("share"), }, ...__VLS_functionalComponentArgsRest(__VLS_162));
          ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_161, typeof __VLS_163> & Record<string, unknown>) => void)({ ...{}, label: ("分享次数"), name: ("share"), });
          const __VLS_164 = __VLS_pickFunctionalComponentCtx(__VLS_161, __VLS_163)!;
          let __VLS_165!: __VLS_NormalizeEmits<typeof __VLS_164.emit>;
          {
            let __VLS_166!: 'TInput' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TInput : 'tInput' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tInput : 't-input' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-input'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TInput'];
            const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({ ...{ onEnter: {} as any, }, modelValue: ((__VLS_ctx.formData.share)), placeholder: ("请输入内容"), }));
            ({} as { TInput: typeof __VLS_166; }).TInput;
            ({} as { TInput: typeof __VLS_166; }).TInput;
            const __VLS_168 = __VLS_167({ ...{ onEnter: {} as any, }, modelValue: ((__VLS_ctx.formData.share)), placeholder: ("请输入内容"), }, ...__VLS_functionalComponentArgsRest(__VLS_167));
            ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_166, typeof __VLS_168> & Record<string, unknown>) => void)({ ...{ onEnter: {} as any, }, modelValue: ((__VLS_ctx.formData.share)), placeholder: ("请输入内容"), });
            const __VLS_169 = __VLS_pickFunctionalComponentCtx(__VLS_166, __VLS_168)!;
            let __VLS_170!: __VLS_NormalizeEmits<typeof __VLS_169.emit>;
            let __VLS_171 = { 'enter': __VLS_pickEvent(__VLS_170['enter'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_167, typeof __VLS_168>).onEnter) };
            __VLS_171 = {
              enter: (__VLS_ctx.onEnter)
            };
          }
          (__VLS_164.slots!).default;
        }
        {
          let __VLS_172!: 'TFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TFormItem : 'tFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tFormItem : 't-form-item' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-form-item'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TFormItem'];
          const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({ ...{}, label: ("手机号码"), name: ("phoneNumber"), }));
          ({} as { TFormItem: typeof __VLS_172; }).TFormItem;
          ({} as { TFormItem: typeof __VLS_172; }).TFormItem;
          const __VLS_174 = __VLS_173({ ...{}, label: ("手机号码"), name: ("phoneNumber"), }, ...__VLS_functionalComponentArgsRest(__VLS_173));
          ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_172, typeof __VLS_174> & Record<string, unknown>) => void)({ ...{}, label: ("手机号码"), name: ("phoneNumber"), });
          const __VLS_175 = __VLS_pickFunctionalComponentCtx(__VLS_172, __VLS_174)!;
          let __VLS_176!: __VLS_NormalizeEmits<typeof __VLS_175.emit>;
          {
            let __VLS_177!: 'TInput' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TInput : 'tInput' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tInput : 't-input' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-input'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TInput'];
            const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({ ...{ onEnter: {} as any, }, modelValue: ((__VLS_ctx.formData.phoneNumber)), placeholder: ("请输入内容"), }));
            ({} as { TInput: typeof __VLS_177; }).TInput;
            ({} as { TInput: typeof __VLS_177; }).TInput;
            const __VLS_179 = __VLS_178({ ...{ onEnter: {} as any, }, modelValue: ((__VLS_ctx.formData.phoneNumber)), placeholder: ("请输入内容"), }, ...__VLS_functionalComponentArgsRest(__VLS_178));
            ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_177, typeof __VLS_179> & Record<string, unknown>) => void)({ ...{ onEnter: {} as any, }, modelValue: ((__VLS_ctx.formData.phoneNumber)), placeholder: ("请输入内容"), });
            const __VLS_180 = __VLS_pickFunctionalComponentCtx(__VLS_177, __VLS_179)!;
            let __VLS_181!: __VLS_NormalizeEmits<typeof __VLS_180.emit>;
            let __VLS_182 = { 'enter': __VLS_pickEvent(__VLS_181['enter'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_178, typeof __VLS_179>).onEnter) };
            __VLS_182 = {
              enter: (__VLS_ctx.onEnter)
            };
          }
          (__VLS_175.slots!).default;
        }
        {
          let __VLS_183!: 'TFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TFormItem : 'tFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tFormItem : 't-form-item' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-form-item'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TFormItem'];
          const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({ ...{}, label: ("用户进场时间"), name: ("startTime"), }));
          ({} as { TFormItem: typeof __VLS_183; }).TFormItem;
          ({} as { TFormItem: typeof __VLS_183; }).TFormItem;
          const __VLS_185 = __VLS_184({ ...{}, label: ("用户进场时间"), name: ("startTime"), }, ...__VLS_functionalComponentArgsRest(__VLS_184));
          ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_183, typeof __VLS_185> & Record<string, unknown>) => void)({ ...{}, label: ("用户进场时间"), name: ("startTime"), });
          const __VLS_186 = __VLS_pickFunctionalComponentCtx(__VLS_183, __VLS_185)!;
          let __VLS_187!: __VLS_NormalizeEmits<typeof __VLS_186.emit>;
          {
            let __VLS_188!: 'TDatePicker' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TDatePicker : 'tDatePicker' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tDatePicker : 't-date-picker' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-date-picker'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TDatePicker'];
            const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({ ...{}, modelValue: ((__VLS_ctx.formData.startTime)), enableTimePicker: (true), allowInput: (true), clearable: (true), }));
            ({} as { TDatePicker: typeof __VLS_188; }).TDatePicker;
            const __VLS_190 = __VLS_189({ ...{}, modelValue: ((__VLS_ctx.formData.startTime)), enableTimePicker: (true), allowInput: (true), clearable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_189));
            ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_188, typeof __VLS_190> & Record<string, unknown>) => void)({ ...{}, modelValue: ((__VLS_ctx.formData.startTime)), enableTimePicker: (true), allowInput: (true), clearable: (true), });
            const __VLS_191 = __VLS_pickFunctionalComponentCtx(__VLS_188, __VLS_190)!;
            let __VLS_192!: __VLS_NormalizeEmits<typeof __VLS_191.emit>;
          }
          (__VLS_186.slots!).default;
        }
        {
          let __VLS_193!: 'TFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TFormItem : 'tFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tFormItem : 't-form-item' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-form-item'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TFormItem'];
          const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({ ...{}, label: ("用户离开时间"), name: ("endTime"), }));
          ({} as { TFormItem: typeof __VLS_193; }).TFormItem;
          ({} as { TFormItem: typeof __VLS_193; }).TFormItem;
          const __VLS_195 = __VLS_194({ ...{}, label: ("用户离开时间"), name: ("endTime"), }, ...__VLS_functionalComponentArgsRest(__VLS_194));
          ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_193, typeof __VLS_195> & Record<string, unknown>) => void)({ ...{}, label: ("用户离开时间"), name: ("endTime"), });
          const __VLS_196 = __VLS_pickFunctionalComponentCtx(__VLS_193, __VLS_195)!;
          let __VLS_197!: __VLS_NormalizeEmits<typeof __VLS_196.emit>;
          {
            let __VLS_198!: 'TDatePicker' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TDatePicker : 'tDatePicker' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tDatePicker : 't-date-picker' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-date-picker'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TDatePicker'];
            const __VLS_199 = __VLS_asFunctionalComponent(__VLS_198, new __VLS_198({ ...{}, modelValue: ((__VLS_ctx.formData.endTime)), enableTimePicker: (true), allowInput: (true), clearable: (true), }));
            ({} as { TDatePicker: typeof __VLS_198; }).TDatePicker;
            const __VLS_200 = __VLS_199({ ...{}, modelValue: ((__VLS_ctx.formData.endTime)), enableTimePicker: (true), allowInput: (true), clearable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_199));
            ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_198, typeof __VLS_200> & Record<string, unknown>) => void)({ ...{}, modelValue: ((__VLS_ctx.formData.endTime)), enableTimePicker: (true), allowInput: (true), clearable: (true), });
            const __VLS_201 = __VLS_pickFunctionalComponentCtx(__VLS_198, __VLS_200)!;
            let __VLS_202!: __VLS_NormalizeEmits<typeof __VLS_201.emit>;
          }
          (__VLS_196.slots!).default;
        }
        {
          let __VLS_203!: 'TFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TFormItem : 'tFormItem' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tFormItem : 't-form-item' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-form-item'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TFormItem'];
          const __VLS_204 = __VLS_asFunctionalComponent(__VLS_203, new __VLS_203({ ...{}, label: ("预约日期"), name: ("orderDate"), }));
          ({} as { TFormItem: typeof __VLS_203; }).TFormItem;
          ({} as { TFormItem: typeof __VLS_203; }).TFormItem;
          const __VLS_205 = __VLS_204({ ...{}, label: ("预约日期"), name: ("orderDate"), }, ...__VLS_functionalComponentArgsRest(__VLS_204));
          ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_203, typeof __VLS_205> & Record<string, unknown>) => void)({ ...{}, label: ("预约日期"), name: ("orderDate"), });
          const __VLS_206 = __VLS_pickFunctionalComponentCtx(__VLS_203, __VLS_205)!;
          let __VLS_207!: __VLS_NormalizeEmits<typeof __VLS_206.emit>;
          {
            let __VLS_208!: 'TDatePicker' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.TDatePicker : 'tDatePicker' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx.tDatePicker : 't-date-picker' extends keyof typeof __VLS_ctx ? (typeof __VLS_ctx)['t-date-picker'] : (typeof __VLS_resolvedLocalAndGlobalComponents)['TDatePicker'];
            const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({ ...{}, modelValue: ((__VLS_ctx.formData.orderDate)), enableTimePicker: (true), allowInput: (true), clearable: (true), }));
            ({} as { TDatePicker: typeof __VLS_208; }).TDatePicker;
            const __VLS_210 = __VLS_209({ ...{}, modelValue: ((__VLS_ctx.formData.orderDate)), enableTimePicker: (true), allowInput: (true), clearable: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_209));
            ({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_208, typeof __VLS_210> & Record<string, unknown>) => void)({ ...{}, modelValue: ((__VLS_ctx.formData.orderDate)), enableTimePicker: (true), allowInput: (true), clearable: (true), });
            const __VLS_211 = __VLS_pickFunctionalComponentCtx(__VLS_208, __VLS_210)!;
            let __VLS_212!: __VLS_NormalizeEmits<typeof __VLS_211.emit>;
          }
          (__VLS_206.slots!).default;
        }
        (__VLS_50.slots!).default;
      }
      (__VLS_45.slots!).default;
    }
    (__VLS_3.slots!).default;
  }
  if (typeof __VLS_styleScopedClasses === 'object' && !Array.isArray(__VLS_styleScopedClasses)) {
  }
  var __VLS_slots!: {};
  // @ts-ignore
  [handlerEdit, radio, radio, radio, groupChangeFn, visible, loading, edit, close, visible, loading, edit, close, visible, loading, edit, close, FORM_RULES, formData, FORM_RULES, formData, FORM_RULES, formData, form, formData, formData, formData, onEnter, formData, formData, formData, formData, formData, formData, formData, formData, formData, formData, formData, formData, formData, formData, formData, formData, formData, formData, scope, scope, scope, scope, scope, scope, , formData, formData, formData, onEnter, formData, formData, formData, onEnter, formData, formData, formData, onEnter, formData, formData, formData, onEnter, formData, formData, formData, onEnter, formData, formData, formData, formData, formData, formData, formData, formData, formData,];
  return __VLS_slots;
}
