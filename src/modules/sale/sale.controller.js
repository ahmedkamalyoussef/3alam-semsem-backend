import Sale from "./sale.model.js";
import SaleItem from "../saleItem/saleItem.model.js";
import Product from "../product/product.model.js";
import { Op } from "sequelize";

export const createSale = async (req, res) => {
  const t = await Sale.sequelize.transaction();

  try {
    const { items } = req.body; 

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Sale must have at least one item" });
    }

    let totalPrice = 0;

    const sale = await Sale.create({ totalPrice: 0 }, { transaction: t });

    const saleItems = await Promise.all(
      items.map(async (i) => {
        const product = await Product.findByPk(i.productId);
        if (!product) throw new Error(`Product with id ${i.productId} not found`);

        if (product.stock < i.quantity) {
          throw new Error(`Not enough stock for product: ${product.name}`);
        }

        const subTotal = i.quantity * product.price;
        totalPrice += subTotal;

        product.stock -= i.quantity;
        await product.save({ transaction: t });

        return SaleItem.create(
          {
            saleId: sale.id,
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: product.price, 
            subTotal,
          },
          { transaction: t }
        );
      })
    );

    
    sale.totalPrice = totalPrice;
    await sale.save({ transaction: t });

    await t.commit();
    res.status(201).json({ sale, items: saleItems });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};


export const getSales = async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [{ model: SaleItem, include: [Product] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [{ model: SaleItem, include: [Product] }],
    });

    if (!sale) return res.status(404).json({ message: "Sale not found" });

    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getMonthlyStats = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and Year are required" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const sales = await Sale.findAll({
      where: {
        saleDate: { [Op.between]: [startDate, endDate] },
      },
      include: [{ model: SaleItem, include: [Product] }],
      order: [["createdAt", "DESC"]],
    });

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalPrice, 0);

    res.json({
      month,
      year,
      totalRevenue,
      sales,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

  export const deleteSale = async (req, res) => {
  const t = await Sale.sequelize.transaction();

  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [{ model: SaleItem, include: [Product] }],
      transaction: t
    });
    
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    
    for (const saleItem of sale.SaleItems) {
      const product = await Product.findByPk(saleItem.productId, { transaction: t });
      if (product) {
        product.stock += saleItem.quantity; 
        await product.save({ transaction: t });
      }
    }

    
    await SaleItem.destroy({
      where: { saleId: sale.id },
      transaction: t
    });

    
    await sale.destroy({ transaction: t });

    await t.commit();
    res.json({ message: "Sale deleted successfully" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};
