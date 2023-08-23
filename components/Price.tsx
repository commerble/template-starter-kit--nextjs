type Props = {
    value: number
    excludeTax?: boolean
    noTax?: boolean
    strong?: boolean
    attention?: boolean
    mark?: boolean
    hiddenTax?: boolean
}
export const Price: React.FC<Props> = ({
    value, 
    excludeTax, 
    noTax, 
    strong , 
    attention, 
    mark, 
    hiddenTax
}) => {
    const tax = noTax ? '(非課税)' : excludeTax ? '(税抜)' : '(税込)';
    
    const className = ['price'];
    if (strong) className.push('price--strong');
    if (attention) className.push('price--attention');

    return <span className={className.join(' ')}>
        {mark && <span className="price__mark">&yen;</span>}
        <span className="price__value">
            {value?.toLocaleString()}
        </span>
        {!mark && <span className="price__unit">円</span>}
        {!hiddenTax && <span className="price__tax">{ tax }</span>}
    </span>
}