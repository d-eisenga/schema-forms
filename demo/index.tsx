import {Option, isSome} from '@effect/data/Option';
import {MessageAnnotation} from '@effect/schema/AST';
import * as S from '@effect/schema/Schema';
import {formatErrors} from '@effect/schema/TreeFormatter';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {SchemaField, SchemaFieldProps} from '../lib/SchemaField';
import {SchemaForm} from '../lib/SchemaForm';
import {ErrorList} from '../lib/types';
import {chainSchema} from './util';

const NonEmptyString = (message: MessageAnnotation<unknown>) => S.string.pipe(
  S.message(message),
  S.trimmed(),
  S.nonEmpty({message})
);

const Name = NonEmptyString(() => 'is required').pipe(
  S.maxLength(30, {message: () => 'cannot exceed 30 characters'}),
  S.pattern(/^[a-zA-Z \-.]+$/u, {message: () => 'may only contain letters, spaces, and dashes'})
);

const Age = S.number.pipe(
  S.message(() => 'must be a number'),
  S.nonNegative({message: () => 'cannot be negative'}),
  S.finite({message: () => 'must be finite'})
);
const AgeFromString = NonEmptyString(() => 'is required').pipe(
  S.numberFromString,
  chainSchema(Age)
);

const Errors = ({errors}: {errors: Option<ErrorList>}) => (
  isSome(errors) ? (
    <ul>
      {errors.value.map(e => {
        const err = formatErrors([e]);
        return <li key={err}>{err}</li>;
      })}
    </ul>
  ) : null
);

const User = S.struct({
  name: Name,
  age: Age,
});

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
const TextField = <T extends unknown>({
  name,
  Schema,
}: Omit<SchemaFieldProps<string, T>, 'render'>) => (
  <SchemaField
    name={name}
    Schema={Schema}
    render={({value, onChange, fieldErrors}) => (
      <>
        <input
          value={isSome(value) ? value.value : ''}
          onChange={e => onChange(e.target.value)}
        />
        <Errors errors={fieldErrors} />
      </>
    )}
  />
);

const TestForm = () => (
  <SchemaForm
    Schema={User}
    onSubmit={console.log}
    initialValues={{
      name: '123',
      age: 'abc',
    }}
    render={({data, decoded, formErrors}) => {
      console.log({data, decoded, formErrors});
      return (
        <>
          <TextField name="name" Schema={Name} />
          <TextField name="age" Schema={AgeFromString} />
          <input type="submit" disabled={isSome(formErrors)} />
          <Errors errors={formErrors} />
        </>
      );
    }}
  />
);

const container = document.getElementById('app');
if (container !== null) {
  const root = createRoot(container);
  root.render(<TestForm />);
}
