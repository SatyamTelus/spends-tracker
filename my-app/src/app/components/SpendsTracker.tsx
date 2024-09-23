import {
  Button,
  Form,
  FormProps,
  Input,
  Popconfirm,
  Select,
  Table,
} from 'antd';
import * as React from 'react';
import './SpendsTracker.css';
import ReactECharts from 'echarts-for-react';
import Title from 'antd/es/typography/Title';

type FieldType = {
  expenseName: string;
  category: string;
  expenseAmount: number;
};
type ExpenseCategories = {
  Food: number;
  Transport: number;
  Groceries: number;
  RentAndAssets: number;
  Miscallaneous: number;
};
export function SpendsTracker() {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = React.useState<
    Array<FieldType & { key: string }>
  >([]);
  const [expenseCategoriesTotal, setExpenseCategoriesTotal] =
    React.useState<ExpenseCategories>({
      Food: 0,
      Transport: 0,
      Groceries: 0,
      RentAndAssets: 0,
      Miscallaneous: 0,
    });
  const onFinish: FormProps<FieldType>['onFinish'] = values => {
    console.log('Success:', values);
    const currentDateKey = dataSource[dataSource.length - 1]?.key ?? 0;
    const newEntry: FieldType & { key: string } = {
      key: currentDateKey + 1,
      ...values,
    };
    setDataSource(prevData => [...prevData, newEntry]);
    // Update the expense categories total
    const category = values.category;
    setExpenseCategoriesTotal(prevCategories => {
      const newCategories = { ...prevCategories };
      newCategories[category] = parseFloat(
        (newCategories[category] ?? 0) + values.expenseAmount,
      );
      return newCategories;
    });
    form.resetFields();
  };
  const handleDelete = (key: React.Key) => {
    const newData = dataSource.filter(item => item.key !== key);
    setDataSource(newData);
    const category = dataSource.find(item => item.key === key)?.category;
    if (!category) return;
    setExpenseCategoriesTotal(prevCategories => {
      const newCategories = { ...prevCategories };
      newCategories[category] =
        (newCategories[category] ?? 0) -
        (dataSource.find(item => item.key === key)?.expenseAmount ?? 0);
      return newCategories;
    });
  };
  const getChartDetails = () => {
    // Update the chart details
    console.log('totals', expenseCategoriesTotal);
    return [
      { value: expenseCategoriesTotal.Food, name: 'Food' },
      { value: expenseCategoriesTotal.Transport, name: 'Transport' },
      { value: expenseCategoriesTotal.Groceries, name: 'Groceries' },
      { value: expenseCategoriesTotal.RentAndAssets, name: 'Rent and Assets' },
      { value: expenseCategoriesTotal.Miscallaneous, name: 'Miscallaneous' },
    ];
  };

  const tableColumns = [
    {
      title: 'Expense Name',
      dataIndex: 'expenseName',
      key: 'expenseName',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Expense Amount',
      dataIndex: 'expenseAmount',
      key: 'expenseAmount',
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record.key)}
          >
            <a>Delete</a>
          </Popconfirm>
        ) : null,
    },
  ];
  const categorySelectOptions = [
    {
      value: 'Transport',
      label: 'Transport',
    },
    {
      value: 'Food',
      label: 'Food',
    },
    {
      value: 'Groceries',
      label: 'Groceries',
    },
    {
      value: 'Rent and Assets',
      label: 'Rent and Assets',
    },
    {
      value: 'Miscallaneous',
      label: 'Miscallaneous',
    },
  ];
  const chartOptions = {
    title: {
      text: 'Expense Analyzer',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: 'Categories',
        type: 'pie',
        radius: '50%',
        data: getChartDetails(),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  return (
    <div className="app-header">
      <h1> Monthly Expense Tracker </h1>
      <div className="spends-form">
        <Title level={4}>Add New Expense: </Title>
        <Form
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 14 }}
          layout={'horizontal'}
          onFinish={onFinish}
          form={form}
          initialValues={{ layout: 'horizontal' }}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="expenseName"
            rules={[{ required: true, message: 'Please input expense name!' }]}
            label="Expense Name"
          >
            <Input placeholder="Enter Expense Name" />
          </Form.Item>
          <Form.Item
            name="category"
            rules={[{ required: true, message: 'Please input category!' }]}
            label="Category"
          >
            <Select
              showSearch
              placeholder="Spend Category"
              options={categorySelectOptions}
              optionFilterProp="label"
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? '')
                  .toLowerCase()
                  .localeCompare((optionB?.label ?? '').toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item
            name="expenseAmount"
            rules={[
              { required: true, message: 'Please input expense amount!' },
            ]}
            label="Expense Amount"
          >
            <Input type="number" placeholder="Enter Expense Amount in ₹" />
          </Form.Item>
          <Form.Item wrapperCol={{ span: 14, offset: 4 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div className="soends-table">
        <Table dataSource={dataSource} columns={tableColumns} />;
      </div>
      <div className="expense-analyzer">
        <ReactECharts
          option={chartOptions}
          style={{ height: 400, width: '100%' }}
        />
      </div>
    </div>
  );
}
