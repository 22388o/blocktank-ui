import React, { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
	navigate,
	refreshOrder,
	selectOrders,
	selectOrdersState,
	TPublicPage
} from '../../../store/public-store';
import FormCard from '../../../components/form-card';
import Spinner from '../../../components/spinner';
import Divider from '../../../components/divider';
import Button from '../../../components/action-button';
import { ReactComponent as TransferActive } from '../../../icons/transfer-active.svg';
import { ReactComponent as Lightning } from '../../../icons/lightning.svg';
import { ReactComponent as LightningActive } from '../../../icons/lightning-active.svg';
import { ReactComponent as LightningGreen } from '../../../icons/lightning-green.svg';
import { ReactComponent as LightningRed } from '../../../icons/lightning-red.svg';

import './index.scss';

const ListItem = ({
	key,
	Icon,
	title,
	subHeading,
	label,
	onClick,
	buttonText,
	hasScrollBar
}: {
	key: string;
	Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
	title: string;
	subHeading: string;
	label: string;
	onClick: () => void;
	buttonText: string;
	hasScrollBar: boolean;
}): JSX.Element => {
	return (
		<div key={key} className={`order-list-item ${hasScrollBar ? 'with-scrollbar' : ''}`}>
			<p className={'order-list-item-date'}>{title}</p>
			<div className={'order-list-content'}>
				<div className={'order-list-details'}>
					<span className={'order-status-heading'}>{subHeading}</span>
					<span className={'order-status-value'}>
						<Icon className={'order-status-icon'} />
						{label}
					</span>
				</div>

				<Button onClick={onClick}>{buttonText}</Button>
			</div>
			<Divider />
		</div>
	);
};

function OrdersPage(): JSX.Element {
	const orders = useAppSelector(selectOrders);
	const ordersState = useAppSelector(selectOrdersState);
	const dispatch = useAppDispatch();

	useEffect(() => {
		orders.forEach((o) => {
			dispatch(refreshOrder(o._id)).catch((e) => alert(e));
		});
	}, []);

	if (ordersState === 'loading') {
		return (
			<FormCard>
				<Spinner style={{ fontSize: 8 }} centered />
			</FormCard>
		);
	}

	// After 4 orders we need to add padding on the right for the scrollbar
	const hasScrollbar = orders.length > 4;

	return (
		<FormCard title={'My orders'} backPage={'configure'}>
			<div className={'orders-container'}>
				{orders.length === 0 ? (
					<ListItem
						key={'no-order'}
						Icon={LightningActive}
						title={'No orders yet'}
						subHeading={'New channel'}
						label={'Lightning channel'}
						buttonText={'Create channel'}
						onClick={() => dispatch(navigate({ page: 'configure' }))}
						hasScrollBar={hasScrollbar}
					/>
				) : null}
				{orders.map(({ _id, state, stateMessage, created_at }) => {
					const date = new Date(created_at);
					let buttonText = 'Order details';
					let Icon = Lightning;
					let page: TPublicPage = 'order';

					switch (state) {
						case 0: {
							// Awaiting payment
							buttonText = 'Pay now';
							Icon = TransferActive;
							page = 'payment';
							break;
						}
						case 100: {
							// Paid
							buttonText = 'Claim channel';
							page = 'claim';
							break;
						}
						case 200: // URI set
							break;
						case 300: // Channel opening
							Icon = LightningGreen;
							break;
						case 400: // Given up
							Icon = LightningRed;
							break;
						case 450: // Channel closed
							Icon = LightningRed;
							break;
						case 500: // Channel open
							Icon = LightningGreen;
							break;
					}

					return (
						<ListItem
							key={_id}
							Icon={Icon}
							onClick={() => dispatch(navigate({ page, orderId: _id }))}
							title={date.toLocaleString('en-US', {
								month: 'short',
								day: 'numeric',
								year: 'numeric'
							})}
							subHeading={'Order status'}
							label={stateMessage}
							buttonText={buttonText}
							hasScrollBar={hasScrollbar}
						/>
					);
				})}
			</div>
		</FormCard>
	);
}

export default OrdersPage;
