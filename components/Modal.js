export const Modal = ({open, children}) => {
    const className = ['modal'];

    if (open) className.push('modal--open');

    return <div className={className.join(' ')}>
    <div className="modal__container">
        {children}
    </div>
</div>
}