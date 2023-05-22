import React, {useContext} from 'react';
import {SchemaFormContext} from './context';

export const FormDebug = () => {
  const {data, formErrors, decoded} = useContext(SchemaFormContext);
  console.log({data});
  return (
    <pre style={{fontFamily: 'monospace'}}>
      {JSON.stringify({data, formErrors, decoded}, null, 2)}
    </pre>
  );
};
