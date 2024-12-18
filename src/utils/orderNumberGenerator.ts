import OrderModel, { Order } from '../model/Order';

let orderSequence = 1;

const getLastOrderSequence = async (): Promise<number> => {
  try {
    // Find the last order in the database
    const lastOrder: Order | null = await OrderModel.findOne()
      .sort({ _id: -1 })
      .exec();

    if (lastOrder) {
      // Extract sequence number from the last order
      const lastOrderNumber = lastOrder.orderNo.toString();
      return parseInt(lastOrderNumber.substring(6)); // order number format is YYMMDDNNNNN
    }
    return 0; // If there are no orders yet
  } catch (error) {
    console.error('Error getting last order sequence:', error);
    throw error;
  }
};

export const generateOrderNumber = async (): Promise<number> => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);

  try {
    // If orderSequence is 1, validate it from the last order
    if (orderSequence === 1) {
      orderSequence = (await getLastOrderSequence()) + 1;
    }

    // Check if orderSequence exceeds 99999
    if (orderSequence > 99999) {
      orderSequence = 1;
    }

    // Generate the order number
    const sequenceNo = orderSequence.toString().padStart(5, '0');
    const orderNo = parseInt(`${year}${month}${day}${sequenceNo}`);

    // Increment orderSequence for the next order
    orderSequence++;

    return orderNo;
  } catch (error) {
    console.error('Error generating order number:', error);
    throw error;
  }
};
