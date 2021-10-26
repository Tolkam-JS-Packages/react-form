import { createContext } from 'react';
import { Host } from '@tolkam/lib-form';
import Form from './Form';

const FormContext = createContext<IFormContext|null>(null);

FormContext.displayName = 'FormContext';

export interface IFormContext {
    host: Host,
    form: Form,
}

export default FormContext;
