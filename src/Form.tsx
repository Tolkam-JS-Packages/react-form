import * as React from 'react';
import { Component, FormEvent, ReactNode, HTMLAttributes } from 'react';
import { Host, THostProps, THostErrors, TStateListener, IValidator, events, TEventName } from '@tolkam/lib-form';
import { omit } from '@tolkam/lib-utils';
import FormContext from './FormContext';
import Updater from './Updater';
import Listener from './Listener';

const NOOP = (): void => {};

class Form extends Component<IProps, unknown> {

    /**
     * Make helpers available with Form._helper_
     */
    public static Updater = Updater;
    public static Listener = Listener;

    /**
     * @inheritDoc
     */
    public static defaultProps = {
        values: null,
        errors: null,
        busy: false,
        onNativeSubmit: NOOP,
        onNativeReset: NOOP,
        onSend: NOOP,
        onReset: NOOP,
        pure: true,
    };

    /**
     * @type {Host}
     */
    private readonly host: Host;

    /**
     * @type {Function}
     */
    protected unsubOnUpdates: () => void;

    /**
     * @param {IProps} props
     */
    public constructor(props: IProps) {
        super(props);
        this.host = new Host();

        if(props.validator) {
            this.host.validator = props.validator;
        }
    }

    /**
     * @inheritDoc
     */
    public componentDidMount(): void {
        const that = this;
        const { host } = that;
        const { values, onUpdates } = that.props;

        if(onUpdates) {
            that.unsubOnUpdates = host.listen(events.ANY, onUpdates);
        }

        host.init(values);

        // console.log('Form: componentDidMount', host);
    }

    /**
     * @inheritDoc
     */
    public shouldComponentUpdate(nextProps: Readonly<IProps>): boolean {
        const { host, props: prevProps } = this;
        const { errors, busy, values } = nextProps;

        if(prevProps.errors !== errors) {
            host.setErrors(errors!);
        }

        if(prevProps.busy !== busy) {
            host.setBusy(busy!);
        }

        if(prevProps.values !== values) {
            host.init(values);
        }

        if(!nextProps.pure) {
            return true;
        }

        // children updates are handled by the host
        return false;
    }

    /**
     * @inheritDoc
     */
    public componentWillUnmount(): void {
        const unsubOnUpdates = this.unsubOnUpdates;
        unsubOnUpdates && unsubOnUpdates();
    }

    /**
     * @inheritDoc
     */
    public render(): ReactNode {
        const that = this;

        const elementProps = {
            autoComplete: 'off',
            ...omit(that.props, ['values', 'validator', 'busy', 'errors',
                'onUpdates', 'onSend', 'onNativeSubmit', 'onNativeReset', 'pure']),
            onSubmit: that.onFormEvent,
            onReset: that.onFormEvent,
        };

        return <FormContext.Provider value={{form: this, host: that.host}}>
            <form {...elementProps}>{that.props.children}</form>
        </FormContext.Provider>;
    }

    /**
     * Gets form field default value
     *
     * @param name
     * @param def
     *
     * @return any
     */
    public getDefaultValue = (name: string, def: any = null): any => {
        const values = this.props.values;
        return values ? (values[name] ?? def) : def;
    }

    /**
     * Clears the form values
     *
     * @return void
     */
    public clear = (): void => {
        this.host.clear();
    };

    /**
     * Sets external values
     *
     * @param values
     */
    public setValues = (values?: object): void => {
        this.host.init(values);
    };

    /**
     * Sets external errors
     *
     * @param errors
     */
    public setErrors = (errors: THostErrors): void => {
        this.host.setErrors(errors);
    };

    /**
     * Sets busy flag
     *
     * @param busy
     * @param names
     */
    public setBusy = (busy: boolean, names?: []): void => {
        this.host.setBusy(busy, names);
    };

    /**
     * Forces validation
     *
     * @param callback
     * @param sourceName
     */
    public validate = (
        callback?: (props: THostProps) => void,
        sourceName?: string
    ): void => {
        this.host.validate(callback, sourceName);
    };

    /**
     * Subscribes to form events
     *
     * @param eventName
     * @param listener
     * @param name
     */
    public listen = (
        eventName: TEventName,
        listener: TStateListener<THostProps>,
        name?: string
    ): () => void => {
        return this.host.listen(eventName, listener, name);
    };

    /**
     * Handles native form events
     *
     * @param e
     */
    protected onFormEvent = (e: FormEvent): void => {
        const that = this;
        const { props, host } = that;
        const isSubmit = e.type === 'submit';

        isSubmit
            ? props.onNativeSubmit!(e)
            : props.onNativeReset!(e);

        if(!e.defaultPrevented) {
            e.preventDefault();
        }

        if(!e.isPropagationStopped()) {
            e.stopPropagation();
        }

        if(!isSubmit) {
            host.init(props.values);
            props.onReset!();
        } else {
            host.validate((stateProps) => {
                props.onSend!(props.name, stateProps, host.clear);
            });
        }
    };
}
type TSendHandler = (name: string, props: THostProps, clear: () => void) => void;

interface IProps extends HTMLAttributes<HTMLFormElement> {
    // unique form name
    name: string;

    values?: object;
    errors?: THostErrors;
    busy?: boolean;

    // values validator
    validator?: IValidator;

    // lifecycle events
    onNativeSubmit?: (e: FormEvent) => void;
    onNativeReset?: (e: FormEvent) => void;

    onUpdates?: TStateListener<THostProps>;
    onSend?: TSendHandler;
    onReset?: () => void;

    // whether to update only on form data updates
    pure?: boolean;
}

export default Form;
export { IProps, TEventName, events, TSendHandler };
