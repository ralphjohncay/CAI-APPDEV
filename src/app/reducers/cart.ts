import {CART_ADD, CART_CLEAR, CART_REMOVE, CART_UPDATE_QTY} from '../actions';
import type {CartLine} from '../../api/types';

export interface CartState {
  items: CartLine[];
}

interface CartAddAction {
  type: typeof CART_ADD;
  payload: CartLine;
}

interface CartRemoveAction {
  type: typeof CART_REMOVE;
  payload: {key: string};
}

interface CartUpdateQtyAction {
  type: typeof CART_UPDATE_QTY;
  payload: {key: string; quantity: number};
}

interface CartClearAction {
  type: typeof CART_CLEAR;
}

type CartAction = CartAddAction | CartRemoveAction | CartUpdateQtyAction | CartClearAction;

const INITIAL: CartState = {items: []};

export default function reducer(state: CartState = INITIAL, action: CartAction): CartState {
  switch (action.type) {
    case CART_ADD: {
      const existing = state.items.find(i => i.key === action.payload.key);
      if (existing) {
        return {
          items: state.items.map(i =>
            i.key === action.payload.key
              ? {...i, quantity: i.quantity + action.payload.quantity}
              : i,
          ),
        };
      }
      return {items: [...state.items, action.payload]};
    }
    case CART_REMOVE:
      return {items: state.items.filter(i => i.key !== action.payload.key)};
    case CART_UPDATE_QTY:
      return {
        items: state.items
          .map(i =>
            i.key === action.payload.key ? {...i, quantity: action.payload.quantity} : i,
          )
          .filter(i => i.quantity > 0),
      };
    case CART_CLEAR:
      return INITIAL;
    default:
      return state;
  }
}

export function cartTotal(items: CartLine[]): number {
  return items.reduce((sum, line) => sum + Number(line.price) * line.quantity, 0);
}
