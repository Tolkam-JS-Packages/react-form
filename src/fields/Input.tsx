import * as React from 'react';
import { ChangeEvent, KeyboardEvent, HTMLProps, ReactNode } from 'react';
import { omit } from '@tolkam/lib-utils';
import AbstractField from './AbstractField';

class Input extends AbstractField<IProps, IState> {

    public static defaultProps = {
        updateOn: 'change',
    };

    /**
     * @type {IState}
     */
    public state = {
        value: null,
    };

    /**
     * @type {Function}
     */
    protected unlisten: Function;

    /**
     * @type {boolean}
     */
    protected isCheckbox: boolean;

    /**
     * @type {boolean}
     */
    protected isRadio: boolean;

    /**
     * @type {boolean}
     */
    protected isFile: boolean;

    /**
     * @type {HTMLInputElement|null}
     */
    protected ref: HTMLInputElement|null;

    /**
     * @param props
     */
    public constructor(props: IProps) {
        super(props);
        const { type } = props;

        this.isCheckbox = type === 'checkbox';
        this.isRadio = type === 'radio';
        this.isFile = type === 'file';
    }

    /**
     * Gets html element
     *
     * @returns {HTMLInputElement|null}
     */
    public get element(): HTMLInputElement|null {
        return this.ref;
    }

    /**
     * @inheritDoc
     */
    public componentDidMount(): void {
        const listen = this.props.listen;
        if(listen) {
            this.unlisten = listen((value: string) => this.setState({ value }));
        }
    }

    /**
     * @inheritDoc
     */
    public componentWillUnmount(): void {
        const {unlisten} = this;
        unlisten && unlisten();
    }

    /**
     * @inheritDoc
     */
    render(): ReactNode {
        const { onChanges, props, isCheckbox, isRadio, isFile } = this;
        const stateValue = this.getStateValue();
        let propsValue = this.getPropsValue();

        const fieldProps = {
            onChange: onChanges,
            onBlur: onChanges,
            ref: (r: HTMLInputElement) => this.ref = r,
            ...omit(props, ['listen', 'update', 'setBusy',
                'setErrors', 'updateOn', 'asArray'])
        };

        // fix form submission if updating on blur
        if(props.updateOn === 'blur') {
            fieldProps.onKeyDown = this.preventEnter;
        }

        if(isCheckbox || isRadio) {
            let checked = stateValue === propsValue;
            if(isCheckbox && props.asArray) {
                checked = stateValue.indexOf(propsValue) !== -1;
            }
            fieldProps.checked = checked;

        } else if(isFile) {
            // no value
        } else {
            fieldProps.value = stateValue;
        }

        return <input {...fieldProps} />;
    }

    /**
     * @param e
     *
     * @returns {void}
     */
    protected onChanges = (e: ChangeEvent<HTMLInputElement>): void => {
        const that = this;
        const { props, isCheckbox, isRadio } = that;
        const { update } = props;
        const { target: eventTarget } = e;
        const eventType = e.type;
        let value: TValue = eventTarget.value;

        // cast unchecked checkboxes to null
        if((isCheckbox || isRadio) && !eventTarget.checked) {
            value = null;
        }

        // convert array checkbox values
        if(isCheckbox && props.asArray) {
            value = that.updateArray(that.getStateValue(), that.getPropsValue(), value);
        }

        // use files as value
        if(that.isFile) {
            const files = eventTarget.files;
            value = files && files.length ? files : null;
        }
        that.setState({value}, () => {
            eventType === props.updateOn && update && update(value);
        });
    };

    /**
     * Prevents enter key default action
     *
     * @param e
     */
    protected preventEnter = (e: KeyboardEvent<HTMLInputElement>): void => {
        e.key === 'Enter' && e.preventDefault();
    }


    /**
     * Adds or removes value from array
     *
     * @param arr
     * @param curValue
     * @param newValue
     *
     * @protected
     */
    protected updateArray(arr: string[]|null, curValue?: string|null, newValue?: string|null) {
        arr = Array.isArray(arr) ? arr : [];

        if(newValue != null) {
            arr.indexOf(newValue) === -1 && arr.push(newValue);
        } else {
            arr = arr.filter((v) => v !== curValue);
        }

        // create new array each time
        // to force state updates
        return arr.length ? arr.slice() : null;
    }

    /**
     * Gets normalized props value
     *
     * @protected
     */
    protected getPropsValue() {
        let value = this.props.value;
        return value != null ? value.toString() : value;
    }

    /**
     * Gets normalized state value
     *
     * @protected
     */
    protected getStateValue() {
        let value: any = this.state.value;
        if(value == null) {
            value = this.props.asArray ? [] : '';
        }
        return value;
    }
}

type TValue = string|string[]|FileList|null;

interface IState {
    value: TValue;
}

interface IProps extends HTMLProps<HTMLInputElement> {
    listen?: (listener: (value: unknown) => void) => () => void;
    update?: (value: unknown) => void;
    updateOn?: 'change' | 'blur';
    asArray?: boolean;
}

export default Input;
export { IProps }
