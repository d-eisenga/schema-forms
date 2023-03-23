import * as E from '@effect/data/Either';
import {pipe} from '@effect/data/Function';
import * as O from '@effect/data/Option';
import * as R from '@effect/data/ReadonlyRecord';
import * as S from '@effect/schema/Schema';
import React, {HTMLAttributes, ReactNode, useCallback, useMemo, useState} from 'react';
import {SchemaFormContext} from './context';
import {FormData, FormValue, ErrorList} from './types';
import {foldEither} from './util';

export type FormRenderProps<To> = {
  data: FormData;
  decoded: O.Option<To>;
  errors: O.Option<ErrorList>;
};

export type SchemaFormProps<From, To> = {
  Schema: S.Schema<From, To>;
  onSubmit: (data: To) => unknown;
  render: (props: FormRenderProps<To>) => ReactNode;
} & Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children'>;

export const SchemaForm = <From extends Record<string, unknown>, To>({
  Schema,
  onSubmit,
  render,
  ...props
}: SchemaFormProps<From, To>) => {
  const [rawData, setRawData] = useState<FormData>({});

  const setFieldValue = useCallback((field: string, value: FormValue<unknown, unknown>) => (
    setRawData(current => ({...current, [field]: value}))
  ), [setRawData]);

  const decode = useMemo(() => S.decodeEither(Schema), [Schema]);

  const decodedData = useMemo(() => pipe(
    rawData,
    R.map(foldEither(
      e => e.from,
      v => v.value
    )),
    x => decode(x as unknown as From, {allErrors: true})
  ), [rawData, decode]);

  const submit = useCallback(() => pipe(
    decodedData,
    E.map(onSubmit)
  ), [decodedData, onSubmit]);

  const contextValue = useMemo<SchemaFormContext>(() => ({
    data: rawData,
    setFieldValue: setFieldValue,
    formErrors: pipe(E.getLeft(decodedData), O.map(x => x.errors)),
    decoded: E.getRight(decodedData),
  }), [rawData, setFieldValue, decodedData]);

  const renderProps = useMemo<FormRenderProps<To>>(() => ({
    data: rawData,
    decoded: E.getRight(decodedData),
    errors: pipe(E.getLeft(decodedData), O.map(x => x.errors)),
  }), [rawData, decodedData]);

  return (
    <SchemaFormContext.Provider value={contextValue}>
      <form
        onSubmit={e => {
          e.preventDefault();
          e.stopPropagation();
          submit();
        }}
        {...props}
      >
        {render(renderProps)}
      </form>
    </SchemaFormContext.Provider>
  );
};
