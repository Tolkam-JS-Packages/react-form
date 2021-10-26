import * as React from 'react';
import { ChangeEvent, HTMLProps, ReactNode } from 'react';
import { omit } from '@tolkam/lib-utils';
import AbstractField from './AbstractField';

class Textarea extends AbstractField<IProps, IState> {

    public static defaultProps = {
        updateOn: 'change',
        autoHeight: true,
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
     * @type {HTMLTextAreaElement|null}
     */
    protected ref: HTMLTextAreaElement|null = null;

    /**
     * Gets html element
     *
     * @returns {HTMLTextAreaElement|null}
     */
    public get element(): HTMLTextAreaElement|null {
        return this.ref;
    }

    /**
     * @inheritDoc
     */
    public componentDidMount(): void {
        const { props } = this;
        const { listen } = props;

        if(listen) {
            this.unlisten = listen((value: string) => this.setState({ value }));
        }

        props.autoHeight && autoFitHeight(this.ref!);
    }

    /**
     * @inheritDoc
     */
    public componentDidUpdate() {
        if(this.props.autoHeight) {
            autoFitHeight(this.ref!);
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
            ref: (r: HTMLTextAreaElement) => this.ref = r,
            ...omit(props, ['listen', 'update', 'setBusy', 'setErrors', 'updateOn', 'autoHeight']),
        };

        return <textarea {...fieldProps} />;
    }

    /**
     * @param e
     *
     * @returns {void}
     */
    protected onChanges = (e: ChangeEvent<HTMLTextAreaElement>): void => {
        const that = this;
        const { props } = that;
        const { update } = props;
        const type = e.type;
        const target = e.target;
        const value = target.value;

        this.setState({value}, () => {
            if(type === props.updateOn) {
                props.autoHeight && autoFitHeight(target);
                update && update(value);
            }
        });
    };
}

/**
 * Sets element height depending on contents
 *
 * @param  {HTMLTextAreaElement} element
 *
 * @returns {void}
 */
function autoFitHeight(element: HTMLTextAreaElement): void {
    const style = element.style;

    if(element.scrollHeight) {
        style.height = '0px'; // reset first
        style.height = element.scrollHeight + 'px';
    }
}

interface IState {
    value: string;
}

interface IProps extends HTMLProps<HTMLTextAreaElement> {
    listen?: (listener: (value: unknown) => void) => () => void;
    update?: (value: unknown) => void;
    updateOn?: 'change' | 'blur';
    autoHeight?: boolean;
}

export default Textarea;
export { IProps }
