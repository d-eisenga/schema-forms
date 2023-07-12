import * as E from '@effect/data/Either';
import {pipe} from '@effect/data/Function';
import * as O from '@effect/data/Option';
import * as R from '@effect/data/ReadonlyRecord';
import * as PR from '@effect/schema/ParseResult';
import * as S from '@effect/schema/Schema';
import React, {HTMLAttributes, ReactNode, useCallback, useMemo, useState} from 'react';
import {SchemaFormContext} from './context';
import {FormData, FormValue, ErrorList} from './types';
import {foldFormData} from './util';

export type FormRenderProps<To> = {
  data: FormData;
  decoded: O.Option<To>;
  formErrors: O.Option<ErrorList>;
};

export type SchemaFormProps<From, To> = {
  Schema: S.Schema<From, To>;
  onSubmit: (data: To) => unknown;
  render: (props: FormRenderProps<To>) => ReactNode;
  initialValues?: Record<string, unknown>;
} & Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children'>;

export const SchemaForm = <From extends Record<string, unknown>, To>({
  Schema,
  onSubmit,
  render,
  initialValues = {},
  ...props
}: SchemaFormProps<From, To>) => {
  const [rawData, setRawData] = useState<FormData>({});

  const setFieldValue = useCallback((field: string, value: FormValue<unknown, unknown>) => (
    setRawData(current => ({...current, [field]: value}))
  ), [setRawData]);

  const decode = useMemo(() => S.decodeEither(Schema), [Schema]);

  const decodedData = useMemo(() => pipe(
    rawData,
    foldFormData<E.Either<PR.ParseError, To>>(
      () => E.left(PR.parseError([PR.unexpected('errors')])),
      formData => pipe(
        formData,
        R.map(v => v.right.value),
        x => decode(x as From, {errors: 'all'})
      )
    )
  ), [rawData, decode]);

  const submit = useCallback(() => pipe(
    decodedData,
    E.mapRight(onSubmit)
  ), [decodedData, onSubmit]);

  const contextValue = useMemo<SchemaFormContext>(() => ({
    data: rawData,
    decoded: E.getRight(decodedData),
    formErrors: pipe(E.getLeft(decodedData), O.map(x => x.errors)),
    setFieldValue: setFieldValue,
    initialValues: initialValues,
  }), [rawData, setFieldValue, decodedData, initialValues]);

  const renderProps = useMemo<FormRenderProps<To>>(() => ({
    data: rawData,
    decoded: E.getRight(decodedData),
    formErrors: pipe(E.getLeft(decodedData), O.map(x => x.errors)),
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
