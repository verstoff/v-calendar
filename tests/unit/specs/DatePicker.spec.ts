import { UnwrapNestedRefs, ComponentPublicInstance, h, nextTick } from 'vue';
import { mount, VueWrapper } from '@vue/test-utils';
import DatePicker from '@/components/DatePicker/DatePicker.vue';
import TimePicker from '@/components/TimePicker/TimePicker.vue';
import { DatePickerContext } from '@/use/datePicker';
import dateValues from '../util/dateValues.json';
import wait from '../util/wait';

type DatePickerComponent = UnwrapNestedRefs<DatePickerContext> &
  ComponentPublicInstance;

// #region Test helpers

async function mountDp(props: any) {
  const dpWrapper = mount<DatePickerComponent>(
    // @ts-ignore
    DatePicker,
    { props },
  );
  await nextTick();
  await nextTick();
  return dpWrapper;
}

function getDayClass(vm: DatePickerComponent, date: Date) {
  return `.id-${vm.locale.getDayId(date)}`;
}

function getDayContentClass(vm: DatePickerComponent, date: Date) {
  return `${getDayClass(vm, date)} .vc-day-content`;
}

// #endregion - Test helpers

describe('DatePicker', () => {
  describe(':props', async () => {
    it(':value - does not emit update:modelValue on initial load', async () => {
      const dp = await mountDp({ modelValue: new Date() });
      expect(dp.emitted('update:modelValue')).toBeUndefined();
    });

    it(':value - emits update:modelValue on day click', async () => {
      const date = new Date(2023, 0, 15);
      const initialPage = { year: 2023, month: 1 };
      const dp = await mountDp({ modelValue: null, initialPage });
      const day = dp.get(getDayContentClass(dp.vm, date));
      await day.trigger('click');
      expect(dp.emitted('update:modelValue')).toHaveLength(1);
    });

    it(':model-modifiers - emits correct updated value with number model modifier', async () => {
      const initialDate = new Date(2000, 0, 15);
      const clickDate = new Date(2000, 0, 20);
      const dp = await mountDp({
        modelValue: initialDate.getTime(),
        modelModifiers: {
          number: true,
        },
      });
      const day = dp.get(getDayContentClass(dp.vm, clickDate));
      await day.trigger('click');
      expect(dp.emitted('update:modelValue')![0][0]).toEqual(
        clickDate.getTime(),
      );
    });

    it(':model-modifiers - emits correct updated ISO value with string model modifier', async () => {
      const initialDate = new Date(2000, 0, 15);
      const clickDate = new Date(2000, 0, 20);
      const dp = await mountDp({
        modelValue: initialDate.toISOString(),
        modelModifiers: {
          string: true,
        },
      });
      const day = dp.get(getDayContentClass(dp.vm, clickDate));
      await day.trigger('click');
      expect(dp.emitted('update:modelValue')![0][0]).toEqual(
        clickDate.toISOString(),
      );
    });

    it(':model-modifiers - emits correct masked value with string model modifier', async () => {
      const initialPage = { year: 2000, month: 1 };
      const clickDate = new Date(2000, 0, 20);
      const mask = 'YYYY-MM-DD';
      const dp = await mountDp({
        modelValue: null,
        modelModifiers: {
          string: true,
        },
        masks: {
          modelValue: mask,
        },
        initialPage,
      });
      const day = dp.get(getDayContentClass(dp.vm, clickDate));
      await day.trigger('click');
      expect(dp.emitted('update:modelValue')![0][0]).toEqual('2000-01-20');
    });

    it(':is-required - clears value if new value equal to previous value and is false', async () => {
      const date = new Date(2023, 0, 15);
      const dp = await mountDp({ modelValue: date });
      const day = dp.get(getDayContentClass(dp.vm, date));
      await day.trigger('click');
      expect(dp.emitted('update:modelValue')).toHaveLength(1);
      expect(dp.emitted('update:modelValue')![0][0]).toBe(null);
    });

    it(':is-required - keeps value if new value equal to previous value and is true', async () => {
      const date = new Date(2023, 0, 15);
      const dp = await mountDp({ modelValue: date, isRequired: true });
      const day = dp.get(getDayContentClass(dp.vm, date));
      await day.trigger('click');
      expect(dp.emitted('update:modelValue')).toBeUndefined();
    });

    it(':rules - emits update:modelValue on initial load if rule modifies value', async () => {
      const date = new Date(2023, 0, 15, 0, 0, 0, 0);
      const clickDate = new Date(2023, 0, 15, 12, 0, 0, 0);
      const rules = { hours: 12 };
      const dp = await mountDp({ modelValue: date, rules });
      expect(dp.emitted('update:modelValue')).toHaveLength(1);
      expect(dp.emitted('update:modelValue')![0][0]).toEqual(clickDate);
    });

    // for (const dv of dateValues) {
    //   const dp = await mountDp(dv.props);
    //   it(':value - loads the correct initial page', () => {
    //     expect(() => dp.get(dv.pageEl)).not.toThrowError();
    //   });
    //   if (dv.dayEls) {
    //     it(':value - selects the correct day(s)', () => {
    //       dv.dayEls.forEach(el => {
    //         expect(() => dp.get(el)).not.toThrowError();
    //       });
    //     });
    //   }
    //   if (dv.props.mode !== 'date' && dv.time) {
    //     it(':value - sets the correct time', () => {
    //       const tp = dp.getComponent(TimePicker);
    //       const { hours, minutes, isAM } = dv.time;
    //       expect(tp.vm.hours).toEqual(hours);
    //       expect(tp.vm.minutes).toEqual(minutes);
    //       expect(tp.vm.isAM).toEqual(isAM);
    //     });
    //   }
    //   if (dv.clickEl) {
    //     // it('emits the correct date value on day click', async () => {
    //     //   await dp.find(dv.clickEl).trigger('click');
    //     //   console.log(dp.emitted('update:modelValue'));
    //     //   const newValue = dp.emitted('update:modelValue')![0][0];
    //     //   // expect(newValue).toEqual(dv.newValue);
    //     // });
    //   }
    // }

    // it(':min-date - prevents date before minimum date', async () => {
    //   const dp = mount(DatePicker, {
    //     props: {
    //       modelValue: new Date(2000, 0, 15),
    //       minDate: new Date(2000, 0, 5),
    //     },
    //   });
    //   await dp.vm.$nextTick();
    //   // Day before min date is disabled
    //   expect(dp.find('.id-2000-01-04 .is-disabled').exists()).toBe(true);
    //   // Click day before min date
    //   await dp.find('.id-2000-01-04 .vc-day-content').trigger('click');
    //   await dp.vm.$nextTick();
    //   // Highlight should NOT appear
    //   expect(dp.find('.id-2000-01-04 .vc-highlight').exists()).toBe(false);
    // });

    // it(':min-date - allows date on minimum date', async () => {
    //   const dp = mount(DatePicker, {
    //     props: {
    //       modelValue: new Date(2000, 0, 15),
    //       minDate: new Date(2000, 0, 5),
    //     },
    //   });
    //   await dp.vm.$nextTick();
    //   // Day of min date is not disabled
    //   expect(dp.find('.id-2000-01-05 .is-disabled').exists()).toBe(false);
    //   console.log(dp.find('.id-2000-01-05 .vc-day-content').element);
    //   // Click day of min date
    //   await dp.find('.id-2000-01-05 .vc-day-content').trigger('click');
    //   // Highlight should appear
    //   expect(dp.find('.id-2000-01-05 .vc-highlight').exists()).toBe(true);
    // });

    // it(':max-date - prevents date after maximum date', async () => {
    //   const dp = mount(DatePicker, {
    //     props: {
    //       modelValue: new Date(2000, 0, 15),
    //       maxDate: new Date(2000, 0, 25),
    //     },
    //   });
    //   await dp.vm.$nextTick();
    //   // Day after max date is disabled
    //   expect(dp.find('.id-2000-01-26 .is-disabled').exists()).toBe(true);
    //   // Click day after max date
    //   await dp.find('.id-2000-01-26 .vc-day-content').trigger('click');
    //   // Highlight should NOT appear
    //   expect(dp.find('.id-2000-01-26 .vc-highlight').exists()).toBe(false);
    // });

    // it(':max-date - allows date on maximum date', async () => {
    //   const dp = mount(DatePicker, {
    //     props: {
    //       modelValue: new Date(2000, 0, 15),
    //       maxDate: new Date(2000, 0, 25),
    //     },
    //   });
    //   await dp.vm.$nextTick();
    //   // Day of max date is not disabled
    //   expect(dp.find('.id-2000-01-25 .is-disabled').exists()).toBe(false);
    //   // Click day of max date
    //   await dp.find('.id-2000-01-25 .vc-day-content').trigger('click');
    //   // Highlight should appear
    //   expect(dp.find('.id-2000-01-25 .vc-highlight').exists()).toBe(true);
    // });

    // it(':is-required - keeps date when set', async () => {
    //   const dp = mount(DatePicker, {
    //     props: {
    //       modelValue: new Date(2000, 0, 15),
    //       isRequired: true,
    //     },
    //   });
    //   await dp.vm.$nextTick();
    //   await dp.find('.id-2000-01-25 .vc-day-content').trigger('click');
    //   expect(dp.find('.id-2000-01-25 .vc-highlight').exists()).toBe(true);
    //   await dp.find('.id-2000-01-25 .vc-day-content').trigger('click');
    //   expect(dp.find('.id-2000-01-25 .vc-highlight').exists()).toBe(true);
    // });

    // it(':is-required - clears date when not set', async () => {
    //   const dp = mount(DatePicker, {
    //     props: {
    //       modelValue: new Date(2000, 0, 15),
    //       isRequired: false,
    //     },
    //   });
    //   await dp.vm.$nextTick();
    //   await dp.find('.id-2000-01-25 .vc-day-content').trigger('click');
    //   expect(dp.find('.id-2000-01-25 .vc-highlight').exists()).toBe(true);
    //   await dp.find('.id-2000-01-25 .vc-day-content').trigger('click');
    //   expect(dp.find('.id-2000-01-25 .vc-highlight').exists()).toBe(false);
    // });

    // it(':model-config.fillDate - fills missing date parts for date input', async () => {
    //   const dp = mountWithInputs({
    //     modelValue: null,
    //     mode: 'time',
    //     modelConfig: {
    //       type: 'string',
    //       fillDate: new Date(2021, 0, 1),
    //     },
    //   });
    //   await updateInputs(dp, '12:15 PM');
    //   expect(dp.vm.value_.toISOString()).toEqual('2021-01-01T12:15:00.000Z');
    // });

    // it(':model-config.fillDate - fills missing date parts for date range inputs', async () => {
    //   const dp = mountWithInputs({
    //     modelValue: null,
    //     mode: 'time',
    //     isRange: true,
    //     modelConfig: {
    //       type: 'string',
    //       fillDate: new Date(2021, 0, 1),
    //     },
    //   });
    //   await updateInputs(dp, '12:15 PM', '12:15 PM');
    //   expect(dp.vm.value_).toEqual({
    //     start: new Date('2021-01-01T12:15:00.000Z'),
    //     end: new Date('2021-01-01T12:15:00.000Z'),
    //   });
    // });

    // it(':valid-hours - limits hours to array', async () => {
    //   const hours = [0, 3, 5, 8, 10, 11, 15, 19, 23];
    //   checkValidHours(hours, hours);
    // });

    // it(':valid-hours - limits hours to min/max', async () => {
    //   const prop = { min: 4, max: 15 };
    //   const hours = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    //   checkValidHours(prop, hours);
    // });

    // it(':valid-hours - limits hours to function', async () => {
    //   const prop = (hour, { weekday }) =>
    //     ![1, 7].includes(weekday) || (hour >= 8 && hour <= 12);
    //   const hours = [8, 9, 10, 11, 12];
    //   checkValidHours(prop, hours);
    // });
  });
});

async function checkValidHours(prop: any, hours: number[]) {
  const dp = mount(DatePicker, {
    props: {
      modelValue: new Date(2000, 0, 15),
      mode: 'dateTime',
      is24hr: true,
      validHours: prop,
    },
  });
  await dp.vm.$nextTick();
  await dp.vm.$nextTick();
  const selector = dp.find<HTMLSelectElement>('.vc-select select');
  const options = selector.element.options;
  expect(options.length).toEqual(hours.length);
  hours.forEach((hour, i) => {
    expect(options[i].value).toEqual(hour.toString());
  });
}

function mountWithInputs(props: any) {
  return mount(DatePicker, {
    props: {
      ...props,
      timezone: 'utc',
    },
    slots: {
      default: function (sProps) {
        if (props.isRange) {
          return h('div', [
            h('input', {
              props: {
                modelValue: sProps.inputValue.start,
              },
              on: sProps.inputEvents.start,
            }),
            h('input', {
              props: {
                modelValue: sProps.inputValue.end,
              },
              on: sProps.inputEvents.end,
            }),
          ]);
        }
        return h('input', {
          props: {
            modelValue: sProps.inputValue,
          },
          on: sProps.inputEvents,
        });
      },
    },
  });
}

async function updateInputs(
  dp: VueWrapper,
  startValue: string,
  endValue: string,
) {
  const inputs = dp.findAll('input');
  let input = null;
  if (startValue) {
    input = inputs[0];
    await input.setValue(startValue);
    await input.trigger('change');
  }
  if (endValue) {
    input = inputs[1];
    await input.setValue(endValue);
    await input.trigger('change');
  }
}