import { Controller } from "react-hook-form";

import { FormValues, SelectControllerProps } from "../lib";
import Select from "./Select";

const SelectController = <TForm extends FormValues, T extends string | number = string>(
    props: SelectControllerProps<TForm, T>
) => {
    const { name, control, rules, changeHandler, ...rest } = props;

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, value }, fieldState }) => (
                <Select
                    value={value}
                    onChange={onChange}
                    error={fieldState.error?.message}
                    changeHandler={changeHandler}
                    {...rest}
                />
            )}
        />
    );
};

export default SelectController;