import { toast } from 'react-hot-toast';

export const notifyNotAries = () => toast('You have no aries Powers',
  {
    style: {
      borderRadius: '10px',
      background: '#333',
      color: '#fff',
    },
  }
);

export const successMesasge = (text: string) => toast.success(text)
export const errorMesasge = (text: string) => toast.error(text)













