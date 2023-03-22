import * as O from '@effect/data/Option';
import {createContext} from 'react';
import {FormData, FormValue, ParseErrors} from './types';

export type SchemaFormContext = {
  data: FormData;
  setFieldValue: (fieldName: string, value: FormValue<unknown, unknown>) => void;
  formErrors: O.Option<ParseErrors>;
  decoded: O.Option<unknown>;
};

export const SchemaFormContext = createContext<SchemaFormContext>({
  data: {},
  setFieldValue: () => undefined,
  formErrors: O.none(),
  decoded: O.none(),
});
