import os
import eel
import openpyxl
import pandas as pd
from fractions import Fraction

exe_dir = os.path.dirname(os.path.abspath(__file__))
data_xlsx_path = os.path.join(exe_dir, 'data.xlsx')
people_xlsx_path = os.path.join(exe_dir, 'people.xlsx')

@eel.expose
def addToTable(login, password, total_score, scores_by_type):
    table_df = pd.read_excel(people_xlsx_path)
    match = table_df[(table_df['login'] == login) & (table_df['password'] == password)]

    if not match.empty:
        # Update scores in the DataFrame
        match_index = match.index[0]
        table_df.at[match_index, 'Расширенные знания'] = float(scores_by_type.get("1", 0))
        table_df.at[match_index, 'Логика'] = float(scores_by_type.get("2", 0))
        table_df.at[match_index, 'Вычислительные способности'] = float(scores_by_type.get("3", 0))
        table_df.at[match_index, 'Итого'] = float(total_score)

        # Save the updated DataFrame to people.xlsx
        table_df.to_excel(people_xlsx_path, index=False)

df = pd.read_excel(data_xlsx_path, header=None)
type_question = df[0].tolist()
questions = df[1].tolist()
options = df[2].tolist()
correct_answers = df[3].tolist()


@eel.expose
def get_quiz_data():
    return questions, options, correct_answers, type_question

eel.init('templates')

@eel.expose
def openNewForm():
    eel.show('test.html')

@eel.expose
def authenticate(login, password):
    table_df = pd.read_excel(people_xlsx_path)
    match = table_df[(table_df['login'] == login) & (table_df['password'] == password)]
    return not match.empty



@eel.expose
def getDashboardData(login, password):
    table_df = pd.read_excel(people_xlsx_path)
    match = table_df[(table_df['login'] == login) & (table_df['password'] == password)]

    if not match.empty:
        data = match.iloc[0]
        user_data = {
            'Name': data['имя'],
            'Surname': data['фамилия'],
            'Intell1': float(Fraction(data['Расширенные знания'])),
            'Intell2': float(Fraction(data['Логика'])),
            'Intell3': float(Fraction(data['Вычислительные способности']))
        }
        print(user_data)
        return user_data
    else:
        return None



def demo(x):
    return x**2
