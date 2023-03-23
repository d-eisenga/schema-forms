import * as E from '@effect/data/Either';
import {pipe} from '@effect/data/Function';
import * as O from '@effect/data/Option';
import * as R from '@effect/data/ReadonlyRecord';
import * as S from '@effect/schema/Schema';
import React, {ReactNode, useCallback, useContext, useMemo, useState} from 'react';
import {SchemaFormContext} from './context';
import {ErrorList} from './types';
import {
  chainOption,
  errorValue,
  foldEither,
  getDecodedValue,
  getRawValue,
  validValue,
} from './util';

export type FieldRenderProps<From, To> = {
  value: O.Option<From>;
  onChange: (from: From) => void;
  dirty: boolean;
  touched: boolean;
  focused: boolean;
  decoded: O.Option<To>;
  fieldErrors: O.Option<ErrorList>;
  onFocus: () => void;
  onBlur: () => void;
};

export type SchemaFieldProps<From, To> = {
  name: string;
  Schema: S.Schema<From, To>;
  render: (props: FieldRenderProps<From, To>) => ReactNode;
};

export const SchemaField = <From, To>({
  name,
  Schema,
  render,
}: SchemaFieldProps<From, To>) => {
  const {data, setFieldValue} = useContext(SchemaFormContext);
  const [dirty, setDirty] = useState(false);
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);

  const decode = useMemo(() => S.decodeEither(Schema), [Schema]);
  const isRawType = useMemo(() => S.is(S.from(Schema)), [Schema]);
  const isValueType = useMemo(() => S.is(S.to(Schema)), [Schema]);

  const value = useMemo(() => pipe(
    data,
    R.get(name)
  ), [data, name]);

  const rawValue = useMemo(() => pipe(
    value,
    O.map(getRawValue),
    chainOption(x => isRawType(x) ? O.some(x) : O.none())
  ), [value, isRawType]);

  const decodedValue = useMemo(() => pipe(
    value,
    chainOption(getDecodedValue),
    chainOption(x => isValueType(x) ? O.some(x) : O.none())
  ), [value, isValueType]);

  const onChange = useCallback((from: From) => pipe(
    decode(from, {allErrors: true}),
    foldEither(
      errors => errorValue<From, To>(from, errors.errors),
      v => validValue(from, v)
    ),
    v => {
      setFieldValue(name, v);
      setDirty(true);
    }
  ), [decode, setFieldValue, setDirty]);

  const errors = useMemo(() => pipe(
    value,
    chainOption(E.getLeft),
    O.map(e => e.errors)
  ), [value]);

  const onFocus = useCallback(() => {
    setTouched(true);
    setFocused(true);
  }, [setTouched, setFocused]);

  const onBlur = useCallback(() => {
    setFocused(false);
  }, [setFocused]);

  const renderProps = useMemo<FieldRenderProps<From, To>>(() => ({
    value: rawValue,
    onChange: onChange,
    dirty: dirty,
    touched: touched,
    focused: focused,
    decoded: decodedValue,
    fieldErrors: errors,
    onFocus: onFocus,
    onBlur: onBlur,
  }), [rawValue, onChange, dirty, touched, focused, decodedValue, errors]);

  return (
    <>{render(renderProps)}</>
  );
};
