import * as E from '@effect/data/Either';
import {pipe} from '@effect/data/Function';
import * as N from '@effect/data/Number';
import * as O from '@effect/data/Option';
import * as R from '@effect/data/ReadonlyRecord';
import * as PR from '@effect/schema/ParseResult';
import * as S from '@effect/schema/Schema';
import React, {HTMLAttributes, ReactNode, useCallback, useMemo, useState} from 'react';
import {SchemaFormContext} from './context';
import {FormData, FormValue, ErrorList, ErrorFreeFormData} from './types';

export type FormRenderProps<To> = {
  data: FormData;
  decoded: O.Option<To>;
  errors: O.Option<ErrorList>;
};

export type SchemaFormProps<From, To> = {
  Schema: S.Schema<From, To>;
  onSubmit: (data: To) => unknown;
  render: (props: FormRenderProps<To>) => ReactNode;
  initialValues?: Record<string, unknown>;
} & Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children'>;

const isErrorFreeFormData = (formData: FormData): formData is ErrorFreeFormData => pipe(
  formData,
  R.map(E.getLeft),
  R.compact,
  R.size,
  N.lessThan(1)
);

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
const foldFormData = <A extends unknown>(
  onErrors: (formData: FormData) => A,
  onErrorFree: (formData: ErrorFreeFormData) => A
) => (formData: FormData) => (
  isErrorFreeFormData(formData) ? onErrorFree(formData) : onErrors(formData)
);

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
      () => E.left({
        _tag: 'ParseError',
        errors: [PR.unexpected('errors')],
      }),
      formData => pipe(
        formData,
        R.map(v => v.right.value),
        x => decode(x as From, {errors: 'all'})
      )
    )
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
    initialValues: initialValues,
  }), [rawData, setFieldValue, decodedData, initialValues]);

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
