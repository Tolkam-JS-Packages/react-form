import * as React from 'react';
import { ChangeEvent, HTMLProps, ReactNode } from 'react';
import { omit } from '@tolkam/lib-utils';
import AbstractField from './AbstractField';

class Select extends AbstractField<IProps, IState> {

    public static defaultProps = {
        updateOn: 'change',
    };

    /**
     * @type {IState}
     */
    public state = {
        value: '',
    };

    /**
     * @type {Function}
     */
    protected unlisten: Function;

    /**
     * @type {HTMLSelectElement|null}
     */
    protected ref: HTMLSelectElement|null;

    /**
     * Gets html element
     *
     * @returns {HTMLSelectElement|null}
     */
    public get element(): HTMLSelectElement|null {
        return this.ref;
    }

    /**
     * @inheritDoc
     */
    public componentDidMount(): void {
        const {listen, onUpdates} = this.props;

        if(listen) {
            this.unlisten = listen((value: string) =>
                this.setState({ value }, () => onUpdates && onUpdates(value)));
        }
    }

    /**
     * @inheritDoc
     */
    public componentWillUnmount(): void {
        this.props.listen && this.unlisten();
    }

    /**
     * @inheritDoc
     */
    public render(): ReactNode {
        const { onChanges, props } = this;

        const fieldProps = {
            value: this.state.value || '',
            onChange: onChanges,
            onBlur: onChanges,
            ref: (r: HTMLSelectElement) => this.ref = r,
            ...omit(props, ['listen', 'update', 'setBusy', 'setErrors', 'updateOn', 'onUpdates'])
        };

        return <select {...fieldProps} />;
    }

    /**
     * @param e
     *
     * @returns {void}
     */
    protected onChanges = (e: ChangeEvent<HTMLSelectElement>): void => {
        const that = this;
        const { props } = that;
        const { update, onUpdates } = props;
        const type = e.type;
        const value: string|null = e.target.value || null;

        this.setState({value}, () => {
            if(type === props.updateOn) {
                update && update(value);
                onUpdates && onUpdates(value);
            }
        });
    };
}

interface IState {
    value: string|null;
}

export interface IProps extends HTMLProps<HTMLSelectElement> {
    listen?: (listener: (value: unknown) => void) => () => void;
    update?: (value: unknown) => void;
    updateOn?: 'change' | 'blur';
    onUpdates?: (value: unknown) => void;
}

export default Select;
