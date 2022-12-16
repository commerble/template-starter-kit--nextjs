import { SunIcon } from '@heroicons/react/outline';
import { FC, MouseEventHandler } from 'react';
type Props = {
    looks?: 'primary' | 'text' | 'custom' | 'default'
    type?: 'submit' | 'reset' | 'button'
    loading?: boolean
    className?: string
    disabled?: boolean
    leftIcon?: JSX.Element
    rightIcon?: JSX.Element
    children?: JSX.Element
    onClick?: MouseEventHandler<HTMLButtonElement>
}
export const Button:FC<Props> = (props) => {
    const classNames = ['btn relative', props.className];

    if (props.looks === 'primary') {
        classNames.push('btn-blue h-14');
    }
    else if (props.looks === 'text') {
    }
    else if (props.looks === 'custom') {
    }
    else {
        classNames.push('btn-gray h-14');
    }
    
    return (
        <button type={props.type||'button'} className={classNames.join(' ')} onClick={props.onClick} disabled={props.disabled}>
            {props.leftIcon}
            {props.loading ? (<SunIcon className="inline-block w-6 h-6 animate-spin"/>):(props.children)} 
            {props.rightIcon}
        </button>
    )
}
