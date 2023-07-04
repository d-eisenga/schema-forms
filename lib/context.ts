import * as O from '@effect/data/Option';
import {createContext} from 'react';
import {FormData, FormValue, ErrorList} from './types';

export type SchemaFormContext = {
  data: FormData;
  decoded: O.Option<unknown>;
  formErrors: O.Option<ErrorList>;
  setFieldValue: (fieldName: string, value: FormValue<unknown, unknown>) => void;
  initialValues: Record<string, unknown>;
};

export const SchemaFormContext = createContext<SchemaFormContext>({
  data: {},
  decoded: O.none(),
  formErrors: O.none(),
  setFieldValue: () => undefined,
  initialValues: {},
});
